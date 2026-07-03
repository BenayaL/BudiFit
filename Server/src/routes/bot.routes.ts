// Routes matching ENDPOINTS.bot in the client:
//   POST /api/bot/chat
//   GET  /api/bot/history/:sessionId
//
// Preserves the working Gemini logic from the placeholder server.js and adds:
//   - TypeScript types
//   - Per-session conversation history (persisted in MongoDB)
//   - Auth guard so only logged-in users can chat
//   - Richer Budi system prompt with multi-turn context

import { Router, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import rateLimit from "express-rate-limit";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";
import BotSession, { type IBotMessage } from "../models/botSession.model";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "AI request limit reached. Please wait a moment and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_HISTORY_MESSAGES = 20;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ─── Budi's system prompt ─────────────────────────────────────────────────────

const BUDI_SYSTEM_PROMPT = `You are Budi, the friendly and highly motivating AI fitness assistant for the BudiFit app.
Your personality:
- Energetic, encouraging, and knowledgeable about fitness and nutrition
- You speak like a supportive personal trainer, not a medical professional
- Keep responses concise and actionable — no walls of text
- Use occasional fitness emojis to keep things lively 💪🔥
- Always remind users to consult a doctor for medical advice

Your capabilities:
- Help users plan workouts and understand exercises
- Give advice on nutrition and recovery
- Motivate users to stay consistent with their goals
- Answer questions about the BudiFit app features

You do NOT:
- Diagnose injuries or medical conditions
- Recommend specific supplements or medications
- Replace professional medical or nutritional advice`;

// ─── POST /api/bot/chat ───────────────────────────────────────────────────────

router.post("/chat", authenticateToken, aiLimiter, async (req: AuthenticatedRequest, res: Response) => {
  console.log("[BOT] POST /api/bot/chat reached", {
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
  try {
    const { sessionId, message } = req.body as {
      sessionId?: string;
      message?: string;
    };

    if (!message || typeof message !== "string" || message.trim() === "") {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing from .env");
      res.status(500).json({ message: "AI service is not configured" });
      return;
    }

    // Use the provided sessionId or fall back to the authenticated user's id
    const resolvedSessionId = (sessionId ?? req.authUser!.userId).trim();

    if (!resolvedSessionId) {
      res.status(400).json({ message: "Session ID is required" });
      return;
    }

    // Load existing history from MongoDB (scoped to this user + session)
    const botSession = await BotSession.findOne({
      userId: req.authUser!.userId,
      sessionId: resolvedSessionId,
    }).lean<{ messages: IBotMessage[] }>();

    const history = botSession?.messages ?? [];

    // Build the conversation context to send to Gemini
    const conversationContext = [
      BUDI_SYSTEM_PROMPT,
      ...history.map(
        (msg) => `${msg.role === "user" ? "User" : "Budi"}: ${msg.content}`
      ),
      `User: ${message}`,
      "Budi:",
    ].join("\n\n");

    // Initialize Gemini client and call the model
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationContext,
    });

    const replyText = response.text ?? "Sorry, I couldn't generate a response. Please try again!";

    // Build message objects for storage (timestamp as Date for MongoDB)
    const now = new Date();
    const userMsg: IBotMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: message.trim(),
      timestamp: now,
    };
    const assistantMsg: IBotMessage = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: replyText,
      timestamp: now,
    };

    // Persist both turns; keep at most MAX_HISTORY_MESSAGES via $slice
    await BotSession.findOneAndUpdate(
      { userId: req.authUser!.userId, sessionId: resolvedSessionId },
      {
        $push: {
          messages: {
            $each: [userMsg, assistantMsg],
            $slice: -MAX_HISTORY_MESSAGES,
          },
        },
      },
      { upsert: true, new: true }
    );

    // Return the assistant reply to the client (timestamp serialised as ISO string)
    const reply: ChatMessage = {
      id: assistantMsg.id,
      role: assistantMsg.role,
      content: assistantMsg.content,
      timestamp: assistantMsg.timestamp.toISOString(),
    };

    res.status(200).json({ reply });
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status?: unknown }).status
        : undefined;
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[BOT] Gemini error:", { status, message });
    res.status(500).json({ message: "Failed to generate response" });
  }
});

// ─── DELETE /api/bot/history/:sessionId ──────────────────────────────────────

router.delete("/history/:sessionId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId).trim();

    if (!sessionId) {
      res.status(400).json({ message: "Session ID is required" });
      return;
    }

    await BotSession.deleteOne({ userId: req.authUser!.userId, sessionId });

    res.status(200).json({ sessionId, messages: [] });
  } catch (error) {
    console.error("Delete bot history error:", error);
    res.status(500).json({ message: "Failed to delete chat history" });
  }
});

// ─── GET /api/bot/history/:sessionId ─────────────────────────────────────────

router.get("/history/:sessionId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = String(req.params.sessionId).trim();

    if (!sessionId) {
      res.status(400).json({ message: "Session ID is required" });
      return;
    }

    const botSession = await BotSession.findOne({
      userId: req.authUser!.userId,
      sessionId,
    }).lean<{ messages: IBotMessage[] }>();

    const messages: ChatMessage[] = (botSession?.messages ?? []).map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp instanceof Date
        ? msg.timestamp.toISOString()
        : String(msg.timestamp),
    }));

    res.status(200).json({ sessionId, messages });
  } catch (error) {
    console.error("Get bot history error:", error);
    res.status(500).json({ message: "Failed to get chat history" });
  }
});

export default router;
