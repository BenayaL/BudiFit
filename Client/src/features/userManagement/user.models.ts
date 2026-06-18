// userManagement — data contracts between the frontend and the user/auth backend.
// Interfaces describe API response shapes; types describe primitive unions.

// ─── Primitive types ──────────────────────────────────────────────────────────

export type UserRole = "coach" | "trainee";

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export type Goal =
  | "strength"
  | "cardio"
  | "flex"
  | "weightLoss"
  | "consistency"
  | "energy"
  | "mood"
  | "sleep";

export type Equipment =
  | "barbell"
  | "cables"
  | "dumbbells"
  | "machines"
  | "kettlebell"
  | "pullup"
  | "smith"
  | "bench"
  | "rack"
  | "cardioMachines"
  | "trx"
  | "bands";

export type MedicalCondition =
  | "none"
  | "knee"
  | "back"
  | "shoulder"
  | "wrist_elbow"
  | "hip_ankle"
  | "cardiovascular_breathing"
  | "mobility_balance"
  | "other";

export type PreferredWorkoutTime = "morning" | "afternoon" | "evening";

export type SessionDurationMinutes = 30 | 45 | 60 | 90;

export type Gender = "male" | "female" | "prefer_not_to_say";

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
  fitnessLevel?: FitnessLevel;
  goals: Goal[];
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
  username: string;
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
  age: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  availableEquipment: Equipment[];
  medicalConditions?: MedicalCondition[];
  medicalNotes?: string;
  weeklyWorkouts: number;
  preferredWorkoutTime: PreferredWorkoutTime;
  sessionDurationMinutes: SessionDurationMinutes;
}

export interface TraineeProfileData {
  userId: string;
  age: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  availableEquipment: Equipment[];
  medicalConditions: MedicalCondition[];
  medicalNotes?: string;
  weeklyWorkouts: number;
  preferredWorkoutTime: PreferredWorkoutTime;
  sessionDurationMinutes: SessionDurationMinutes;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingResponse {
  message: string;
  profile: TraineeProfileData;
  user: CurrentUser;
}

export interface TraineeProfileResponse {
  success: boolean;
  profile: TraineeProfileData;
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
