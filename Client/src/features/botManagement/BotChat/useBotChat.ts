import { useState, useEffect, useCallback } from "react";
import type { ChatMessage, ChatStatus } from "../bot.models";
import { botService } from "../botService";
import { useAuth } from "../../../app/AuthContext";

export function useBotChat() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Deterministic per-user session ID — stable across browsers/environments
  // since it derives from the authenticated userId, not local storage.
  useEffect(() => {
    if (!user?.id) return;
    setSessionId(`default:${user.id}`);
  }, [user?.id]);

  // Load history from MongoDB when session is ready
  useEffect(() => {
    if (!token || !sessionId) return;
    botService
      .getChatHistory(sessionId, token)
      .then((session) => {
        setMessages(session.messages);
      })
      .catch((err) => {
        console.error("[BOT] Failed to load history:", err);
      });
  }, [sessionId, token]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!token || !sessionId) {
        setError("You must be logged in to use the chat.");
        return;
      }

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setStatus("typing");
      setError("");

      try {
        const { reply } = await botService.sendMessage(
          { sessionId, message: text },
          token
        );
        setMessages((prev) => [...prev, reply]);
        setStatus("idle");
      } catch (err) {
        console.error("[BOT] Failed to send message:", err);
        setError("Failed to send message. Please try again.");
        setStatus("idle");
      }
    },
    [token, sessionId]
  );

  const clearChat = useCallback(async (): Promise<boolean> => {
    if (!token || !sessionId) {
      setError("You must be logged in to clear the chat.");
      return false;
    }
    try {
      await botService.clearChatHistory(sessionId, token);
      setMessages([]);
      setStatus("idle");
      return true;
    } catch (err) {
      console.error("[BOT] Failed to clear history:", err);
      setError("Failed to clear chat. Please try again.");
      return false;
    }
  }, [token, sessionId]);

  return { messages, status, error, sendMessage, clearChat };
}
