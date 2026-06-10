import { useAuth } from "../../../app/AuthContext";
import type { CurrentUser } from "../user.models";

export interface UserProfileHookResult {
  user: CurrentUser | null;
  isLoading: boolean;
  error: string;
}

export function useUserProfile(): UserProfileHookResult {
  const { user, isInitializing } = useAuth();

  return {
    user,
    isLoading: isInitializing,
    error: !isInitializing && !user ? "Not authenticated." : "",
  };
}
