// coachManagement — data contracts for coach, trainee, and plan objects.

import type { User } from "../userManagement/user.models";

// ─── Primitive types ──────────────────────────────────────────────────────────

export type TraineeStatus = "active" | "needs_attention" | "inactive";
export type PlanStatus = "pending_approval" | "approved" | "rejected";
export type ExerciseDifficulty = "easy" | "moderate" | "hard";
export type ChallengeOutcome = "completed" | "partial" | "missed";

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface Coach extends User {
  assignedTraineeIds: string[];
}

export interface Trainee extends User {
  color: string;
  status: TraineeStatus;
  streakDays: number;
  completedChallenges: number;
  missedWorkouts: number;
  weeklyActivity: number[];
  goals: string[];
}

export interface PlanExercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  durationSec?: number;
  equipment: string;
  difficulty: ExerciseDifficulty;
}

export interface CoachPlan {
  id: string;
  traineeId: string;
  traineeName: string;
  title: string;
  status: PlanStatus;
  exercises: PlanExercise[];
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface CoachDashboardData {
  coach: Coach;
  trainees: Trainee[];
  pendingPlans: CoachPlan[];
}
