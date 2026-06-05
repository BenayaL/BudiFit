import { useState, useEffect } from "react";
import type { UserProfile } from "../user.models";
import type { UserProfilePageState } from "./UserProfile.types";
import { userService } from "../userService";
import { useAuth } from "../../../app/AuthContext";

const FALLBACK_PROFILE: UserProfile = {
  userId: "user-1",
  firstName: "Julian",
  lastName: "Cohen",
  email: "julian@budifit.com",
  level: "Intermediate",
  role: "trainee",
  memberSince: "April 2025",
  streak: 14,
  totalWorkouts: 42,
  totalMinutes: 2520,
  goals: ["consistency", "strength", "cardio", "weightLoss"],
  achievements: [
    { id: "1", title: "First Step", description: "Completed your first workout", earned: true, icon: "flame" },
    { id: "2", title: "7-Day Streak", description: "Showed up for a full week", earned: true, icon: "flame" },
    { id: "3", title: "Early Bird", description: "Workout before 7 AM", earned: true, icon: "clock" },
  ],
};

export function useUserProfile(): UserProfilePageState {
  const { token, updateDisplayInfo } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const error = "";

  useEffect(() => {
    if (!token) {
      setProfile(FALLBACK_PROFILE);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await userService.getUserProfile(token);
        setProfile(data);
        updateDisplayInfo(data.firstName, data.streak);
      } catch {
        // TODO: remove fallback when backend is connected
        console.warn("[DEV] getUserProfile failed — using fallback.");
        setProfile(FALLBACK_PROFILE);
        updateDisplayInfo(FALLBACK_PROFILE.firstName, FALLBACK_PROFILE.streak);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token, updateDisplayInfo]);

  return { profile, isLoading, error };
}
