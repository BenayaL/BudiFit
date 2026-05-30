// features/user — interfaces = TypeScript structures that belong to the user feature
// These interfaces describe user-related object shapes (API responses, profile data, etc.)

import type { Goal } from "../types/user.types";

// Achievement describes a badge a user can earn by completing fitness milestones.
export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  icon: string;
}

// UserProfile is the full data shape for a logged-in user's profile screen.
export interface UserProfile {
  name: string;
  level: string;
  memberSince: string;
  streak: number;
  totalWorkouts: number;
  totalMinutes: number;
  goals: Goal[];
  achievements: Achievement[];
}
