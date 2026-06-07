import { useState, useEffect } from "react";
import type { UserProfile } from "../user.models";
import type { UserProfilePageState } from "./UserProfile.types";
import { userService } from "../userService";
import { useAuth } from "../../../app/AuthContext";

export function useUserProfile(): UserProfilePageState {
  const { token, updateDisplayInfo } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await userService.getUserProfile(token);
        setProfile(data);
        updateDisplayInfo(data.firstName, data.streak);
      } catch (err) {
        console.error("[PROFILE] Failed to load user profile:", err);
        setError("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token, updateDisplayInfo]);

  return { profile, isLoading, error };
}
