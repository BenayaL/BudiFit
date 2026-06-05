import type { ChatMessage, ChatStatus } from "../bot.models";

export interface BotChatState {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string;
}
