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
import rateLimit from "express-rate-limit";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";
import BotSession, { type IBotMessage } from "../models/botSession.model";
import { generateBudiReply } from "../utils/geminiClient";

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

// ─── Legacy-session fallback ──────────────────────────────────────────────────
// Sessions used to get a random client-generated ID stored in localStorage,
// so the same user ended up with a different BotSession per browser/origin.
// Now the client always requests the deterministic `default:${userId}` session.
// If that session is new/empty, adopt the user's most recently active legacy
// session (by copying its messages) so history isn't lost — without deleting
// or renaming the old document.
async function loadSessionMessages(
  userId: string,
  sessionId: string
): Promise<IBotMessage[]> {
  const existing = await BotSession.findOne({ userId, sessionId }).lean<{
    messages: IBotMessage[];
  }>();

  // Doc already exists — whether populated, freshly created, or emptied via
  // "Clear chat" — its state is authoritative. Only a session that has never
  // existed is eligible for the one-time legacy migration below (this also
  // guarantees a cleared chat stays cleared instead of resurrecting legacy
  // history on the next load).
  if (existing) {
    return existing.messages;
  }

  const legacy = await BotSession.findOne({ userId, sessionId: { $ne: sessionId } })
    .sort({ updatedAt: -1 })
    .lean<{ messages: IBotMessage[] }>();

  if (!legacy || legacy.messages.length === 0) {
    return [];
  }

  await BotSession.create({ userId, sessionId, messages: legacy.messages });
  return legacy.messages;
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

    // Load existing history from MongoDB (scoped to this user + session),
    // adopting a legacy session's messages on first use if this one is empty.
    const history = await loadSessionMessages(req.authUser!.userId, resolvedSessionId);

    // Build the conversation context to send to Gemini
    const conversationContext = [
      BUDI_SYSTEM_PROMPT,
      ...history.map(
        (msg) => `${msg.role === "user" ? "User" : "Budi"}: ${msg.content}`
      ),
      `User: ${message}`,
      "Budi:",
    ].join("\n\n");

    const geminiResult = await generateBudiReply(process.env.GEMINI_API_KEY, conversationContext);

    if (!geminiResult.ok) {
      res.status(500).json({ message: geminiResult.message ?? "Failed to generate response" });
      return;
    }

    const replyText = geminiResult.text || "Sorry, I couldn't generate a response. Please try again!";

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

    // Empty (rather than delete) the session doc: its existence marks the
    // session as initialized, so the legacy-migration fallback in
    // loadSessionMessages won't resurrect old history on the next load.
    await BotSession.findOneAndUpdate(
      { userId: req.authUser!.userId, sessionId },
      { $set: { messages: [] } },
      { upsert: true }
    );

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

    const sessionMessages = await loadSessionMessages(req.authUser!.userId, sessionId);

    const messages: ChatMessage[] = sessionMessages.map((msg) => ({
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
