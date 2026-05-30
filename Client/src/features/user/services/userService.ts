// features/user — services = API communication logic
// userService will handle all HTTP requests to the user microservice.

// import { httpClient } from "../../../api/httpClient";
// import type { UserProfile } from "../interfaces/user.interfaces";

export const userService = {
  /**
   * getProfile — fetches the logged-in user's full profile.
   *
   * Usage (future):
   *   const profile = await userService.getProfile(userId);
   */
  getProfile: async (_userId: string) => {
    // TODO: return httpClient.get(`/users/${userId}/profile`);
    throw new Error("userService.getProfile is not yet implemented.");
  },

  /**
   * updateProfile — saves changes to the user's profile.
   */
  updateProfile: async (_userId: string, _data: Partial<{ name: string }>) => {
    // TODO: return httpClient.patch(`/users/${userId}/profile`, data);
    throw new Error("userService.updateProfile is not yet implemented.");
  },
};
