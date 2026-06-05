// botManagement — service layer for AI coaching chat API calls.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";
import type { ChatMessage, SendMessageRequest, SendMessageResponse } from "./bot.models";

export const botService = {
  sendMessage: (data: SendMessageRequest, token: string): Promise<SendMessageResponse> =>
    httpClient.post<SendMessageResponse, SendMessageRequest>(ENDPOINTS.bot.chat, data, token),

  getChatHistory: (sessionId: string, token: string): Promise<ChatMessage[]> =>
    httpClient.get<ChatMessage[]>(ENDPOINTS.bot.history(sessionId), token),
};
