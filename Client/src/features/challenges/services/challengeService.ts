// features/challenges — services = API communication logic
// challengeService will handle requests to the challenges microservice.

// import { httpClient } from "../../../api/httpClient";

export const challengeService = {
  /**
   * getTodayChallenge — fetches the AI-generated challenge for today.
   *
   * Usage (future):
   *   const challenge = await challengeService.getTodayChallenge(userId);
   */
  getTodayChallenge: async (_userId: string) => {
    // TODO: return httpClient.get(`/challenges/today?userId=${userId}`);
    throw new Error("challengeService.getTodayChallenge is not yet implemented.");
  },

  /**
   * completeChallenge — marks today's challenge as completed.
   */
  completeChallenge: async (_challengeId: string) => {
    // TODO: return httpClient.post(`/challenges/${challengeId}/complete`);
    throw new Error("challengeService.completeChallenge is not yet implemented.");
  },
};
