// features/user — interfaces = TypeScript structures that belong to the user feature
// These interfaces describe user-related object shapes (API responses, profile data, etc.)
import type { Goal, UserRole } from "../types/user.types";

// User is the base shape shared by every account (coach or trainee).
// Coach and Trainee interfaces extend this.
export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  role: UserRole;
}

// UserProfile now extends User (inherits userId, firstName, lastName, email, level, role).
export interface UserProfile extends User {
  memberSince: string;
  streak: number;
  totalWorkouts: number;
  totalMinutes: number;
  goals: Goal[];
  achievements: Achievement[];
}

// Achievement stays exactly as it is.
export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  icon: string;
}