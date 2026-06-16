// workoutManagement — data contracts for workout sessions and exercises.

// ─── Primitive types ──────────────────────────────────────────────────────────

export type WorkoutStatus = "not_started" | "in_progress" | "completed";

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  durationSec?: number;
  equipment: string;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  status: WorkoutStatus;
  durationMinutes: number;
  exercises: WorkoutExercise[];
  scheduledAt: string;
}

export type GeneratedWorkoutPlanCategory =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "general_fitness"
  | "mobility"
  | "weight_loss";

export type GeneratedWorkoutPlanStatus =
  | "draft"
  | "active"
  | "completed"
  | "archived";

export type GeneratedWorkoutPlanApprovalStatus =
  | "not_required"
  | "pending_review"
  | "approved";

export interface GeneratedWorkoutProfileSnapshot {
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  weeklyWorkouts: number;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  availableEquipment: string[];
  medicalConditions: string[];
  medicalNotes?: string;
  preferredWorkoutTime?: string;
  sessionDurationMinutes?: number;
}

export interface GeneratedWorkoutExercise {
  id?: string;
  order: number;
  name: string;
  sets?: number;
  reps?: string;
  durationSec?: number;
  restSec?: number;
  equipment: string;
  notes?: string;
}

export interface GeneratedWorkoutDay {
  id?: string;
  dayNumber: number;
  title: string;
  restDay: boolean;
  durationMinutes: number;
  exercises: GeneratedWorkoutExercise[];
}

export type GeneratedWorkoutPlanArchiveReason =
  | "removed_by_trainee"
  | "replaced"
  | "replaced_not_suitable"
  | "removed_by_coach"
  | "superseded_by_new_plan"
  | "other";

// Summary returned by GET /generated-workout-plans (no days, no profileSnapshot)
export interface GeneratedWorkoutPlanSummary {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: GeneratedWorkoutPlanCategory;
  difficulty: number;
  durationWeeks: number;
  workoutDaysPerWeek: number;
  equipment: string[];
  status: GeneratedWorkoutPlanStatus;
  approvalStatus: GeneratedWorkoutPlanApprovalStatus;
  requiresProfessionalReview: boolean;
  createdAt: string;
  updatedAt: string;
  // Server-computed capability flags
  managedByCoach: boolean;
  canViewDetails: boolean;
  canComplete: boolean;
  canRemove: boolean;
  canRequestReplacement: boolean;
  canPermanentlyDelete: boolean;
  hasPendingChangeRequest: boolean;
  // Historical fields — only present when status is "completed" or "archived"
  completedAt?: string;
  archivedAt?: string;
  archiveReason?: GeneratedWorkoutPlanArchiveReason;
  historyEndedAt?: string;
  historyLabel?: string;
  scheduledWorkouts?: number;
  completedWorkouts?: number;
  missedWorkouts?: number;
  completionRate?: number;
}

// Full plan returned by GET /generated-workout-plans/:planId
export interface GeneratedWorkoutPlan extends GeneratedWorkoutPlanSummary {
  profileSnapshot: GeneratedWorkoutProfileSnapshot;
  days: GeneratedWorkoutDay[];
}

export interface GeneratedWorkoutPlansResponse {
  success: boolean;
  plans: GeneratedWorkoutPlanSummary[];
}

export interface GeneratedWorkoutPlanResponse {
  success: boolean;
  plan: GeneratedWorkoutPlan;
}

export interface GenerateWorkoutPlanResponse {
  success: boolean;
  message: string;
  plan: GeneratedWorkoutPlanSummary;
}
