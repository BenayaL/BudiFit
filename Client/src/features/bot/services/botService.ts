// features/bot = domain module for the AI coaching chat assistant
// services = API communication logic

// import { httpClient } from "../../../api/httpClient";

export const botService = {
  /**
   * sendMessage — sends a user message to the AI coach and gets a response.
   *
   * Usage (future):
   *   const reply = await botService.sendMessage(sessionId, message);
   */
  sendMessage: async (_sessionId: string, _message: string) => {
    // TODO: return httpClient.post("/bot/chat", { sessionId, message });
    throw new Error("botService.sendMessage is not yet implemented.");
  },

  /**
   * getChatHistory — retrieves past messages for the current session.
   */
  getChatHistory: async (_sessionId: string) => {
    // TODO: return httpClient.get(`/bot/chat/${sessionId}/history`);
    throw new Error("botService.getChatHistory is not yet implemented.");
  },
};
