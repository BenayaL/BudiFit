// userManagement — data contracts between the frontend and the user/auth backend.
// Interfaces describe API response shapes; types describe primitive unions.

// ─── Primitive types ──────────────────────────────────────────────────────────

export type UserRole = "coach" | "trainee";

export type Goal = "strength" | "cardio" | "flex" | "consistency" | "weightLoss";

export type AuthStatus = "idle" | "loading" | "success" | "error";

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  level: string;
  role: UserRole;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  icon: string;
}

export interface UserProfile extends User {
  memberSince: string;
  streak: number;
  totalWorkouts: number;
  totalMinutes: number;
  goals: Goal[];
  achievements: Achievement[];
}

// ─── Auth request / response shapes ──────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  userId: string;
  role: UserRole;
  hasCompletedOnboarding?: boolean;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function getFullName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
