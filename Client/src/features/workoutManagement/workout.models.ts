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
  | "active"
  | "completed"
  | "archived";

export interface GeneratedWorkoutProfileSnapshot {
  fitnessLevel:
    | "beginner"
    | "intermediate"
    | "advanced";

  goals: string[];
  weeklyWorkouts: number;
  height?: number;
  weight?: number;
  age?: number;
  medicalConditions: string[];
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

export interface GeneratedWorkoutPlan {
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

  requiresProfessionalReview: boolean;

  profileSnapshot: GeneratedWorkoutProfileSnapshot;

  days: GeneratedWorkoutDay[];

  createdAt: string;
  updatedAt: string;
}

export interface GeneratedWorkoutPlansResponse {
  success: boolean;
  plans: GeneratedWorkoutPlan[];
}

export interface GeneratedWorkoutPlanResponse {
  success: boolean;
  plan: GeneratedWorkoutPlan;
}

export interface GenerateWorkoutPlanResponse {
  success: boolean;
  message: string;
  plan: GeneratedWorkoutPlan;
}

