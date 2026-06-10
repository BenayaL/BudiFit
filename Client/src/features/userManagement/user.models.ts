// userManagement — data contracts between the frontend and the user/auth backend.
// Interfaces describe API response shapes; types describe primitive unions.

// ─── Primitive types ──────────────────────────────────────────────────────────

export type UserRole = "coach" | "trainee";

export type Goal = "strength" | "cardio" | "flex" | "consistency" | "weightLoss";

export type AuthStatus = "idle" | "loading" | "success" | "error";

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface NotificationSettings {
  dailyWorkoutReminder: boolean;
  coachMessages: boolean;
  challengeUpdates: boolean;
  reminderTime: string;
}

export interface UserSettings {
  notifications: NotificationSettings;
}

// ─── Current authenticated user (matches GET /api/users/me response) ──────────

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  hasCompletedOnboarding: boolean;
  settings?: UserSettings;
  coachConnectionCode?: string;
  createdAt: string;
}

// ─── Coach connection ─────────────────────────────────────────────────────────

export interface ConnectedCoach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  coachCode?: string;
}

export interface CoachConnectionResponse {
  role: UserRole;
  coach?: ConnectedCoach | null;
  coachCode?: string;
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
  fitnessLevel?: string;
  goals?: string[];
}

export interface RegisterServerResponse {
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: UserRole;
    hasCompletedOnboarding?: boolean;
  };
}

export interface AuthResponse {
  token: string;
  userId: string;
  role: UserRole;
  hasCompletedOnboarding?: boolean;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingRequest {
  fitnessLevel: string;
  goals: string[];
  weeklyWorkouts: number;
  height?: number;
  weight?: number;
  age?: number;
  medicalConditions?: string[];
}

export interface TraineeProfileData {
  userId: string;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  weeklyWorkouts: number;
  height?: number;
  weight?: number;
  age?: number;
  medicalConditions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingResponse {
  message: string;
  profile: TraineeProfileData;
  user: CurrentUser;
}

// ─── Achievement (used by progress/coach features) ───────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  icon: string;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function getFullName(user: Pick<CurrentUser, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
