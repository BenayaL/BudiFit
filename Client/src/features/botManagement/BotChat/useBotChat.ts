import { useState, useRef } from "react";
import type { ChatMessage, ChatStatus } from "../bot.models";
import { botService } from "../botService";
import { useAuth } from "../../../app/AuthContext";

export function useBotChat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const error = "";
  // Stable session ID for the duration of this component mount
  const sessionId = useRef(`session-${Date.now()}`).current;

  async function sendMessage(text: string) {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setStatus("typing");

    try {
      if (!token) throw new Error("Not authenticated");

      const { reply } = await botService.sendMessage(
        { sessionId, message: text },
        token
      );
      setMessages((prev) => [...prev, reply]);
    } catch {
      // DEV fallback — simulated response when backend is unavailable
      if (import.meta.env.DEV) {
        console.warn("[DEV] botService.sendMessage failed — using placeholder reply.");
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Hi! I'm Budi. The backend isn't connected yet — real AI replies are coming soon!",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I could not connect right now. Please try again.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    } finally {
      setStatus("idle");
    }
  }

  return { messages, status, error, sendMessage };
}
