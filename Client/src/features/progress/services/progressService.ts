// features/progress = domain module for workout history, streaks, and analytics
// services = API communication logic

// import { httpClient } from "../../../api/httpClient";

export const progressService = {
  /**
   * getProgressSummary — fetches aggregate stats for the user's progress dashboard.
   *
   * Usage (future):
   *   const summary = await progressService.getProgressSummary(userId);
   */
  getProgressSummary: async (_userId: string) => {
    // TODO: return httpClient.get(`/progress/${userId}/summary`);
    throw new Error("progressService.getProgressSummary is not yet implemented.");
  },

  /**
   * getWorkoutHistory — fetches a paginated list of completed workouts.
   */
  getWorkoutHistory: async (_userId: string, _page = 1) => {
    // TODO: return httpClient.get(`/progress/${userId}/history?page=${page}`);
    throw new Error("progressService.getWorkoutHistory is not yet implemented.");
  },
};
