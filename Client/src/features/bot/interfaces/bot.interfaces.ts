// features/bot — interfaces = TypeScript structures that belong to the bot feature

import type { MessageRole } from "../types/bot.types";

// ChatMessage describes a single message in the AI coaching conversation.
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

// ChatSession groups messages under one conversation session.
export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
}
