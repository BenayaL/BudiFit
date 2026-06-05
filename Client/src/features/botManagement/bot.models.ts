// botManagement — data contracts for the AI coaching chat assistant.

// ─── Primitive types ──────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";
export type ChatStatus = "idle" | "typing" | "error";

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface SendMessageRequest {
  sessionId: string;
  message: string;
}

export interface SendMessageResponse {
  reply: ChatMessage;
}
