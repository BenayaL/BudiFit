import { useState, useRef } from "react";
import type { ChatMessage, ChatStatus } from "../bot.models";
import { botService } from "../botService";
import { useAuth } from "../../../app/AuthContext";

export function useBotChat() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState("");
  const sessionId = useRef(`session-${Date.now()}`).current;

  async function sendMessage(text: string) {
    if (!token) {
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
  }

  return { messages, status, error, sendMessage };
}
