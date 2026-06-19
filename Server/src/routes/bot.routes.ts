// Routes matching ENDPOINTS.bot in the client:
//   POST /api/bot/chat
//   GET  /api/bot/history/:sessionId
//
// Preserves the working Gemini logic from the placeholder server.js and adds:
//   - TypeScript types
//   - Per-session conversation history (in-memory)
//   - Auth guard so only logged-in users can chat
//   - Richer Budi system prompt with multi-turn context

import { Router, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import rateLimit from "express-rate-limit";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// In-memory session store: sessionId → message history
// Good enough for a college project; can be replaced with MongoDB later
const sessionHistory = new Map<string, ChatMessage[]>();

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
    const resolvedSessionId = sessionId ?? req.authUser!.userId;

    // Get or initialize history for this session
    if (!sessionHistory.has(resolvedSessionId)) {
      sessionHistory.set(resolvedSessionId, []);
    }
    const history = sessionHistory.get(resolvedSessionId)!;

    // Build the conversation context to send to Gemini
    // Format: system prompt + previous turns + current message
    const conversationContext = [
      BUDI_SYSTEM_PROMPT,
      ...history.map(
        (msg) => `${msg.role === "user" ? "User" : "Budi"}: ${msg.content}`
      ),
      `User: ${message}`,
      "Budi:",
    ].join("\n\n");

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
    // Call Gemini — same API call that worked in the placeholder server
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationContext,
    });

    const replyText = response.text ?? "Sorry, I couldn't generate a response. Please try again!";

    // Build message objects
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: replyText,
      timestamp: new Date().toISOString(),
    };

    // Save both turns to session history
    history.push(userMessage, assistantMessage);

    // Keep history to last 20 messages to avoid very long prompts
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    res.status(200).json({ reply: assistantMessage });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ message: "Failed to generate response" });
  }
});

// ─── GET /api/bot/history/:sessionId ─────────────────────────────────────────

router.get("/history/:sessionId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const history = sessionHistory.get(sessionId) ?? [];
    res.status(200).json({ sessionId, messages: history });
  } catch (error) {
    console.error("Get bot history error:", error);
    res.status(500).json({ message: "Failed to get chat history" });
  }
});

export default router;