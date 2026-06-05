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
