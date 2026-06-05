import type { UserProfile } from "../user.models";

export interface UserProfilePageState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string;
}

export type { UserProfile };
