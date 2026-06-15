// coachManagement — data contracts for coach, trainee, and plan objects.

import type { UserRole } from "../userManagement/user.models";

// ─── Primitive types ──────────────────────────────────────────────────────────

export type TraineeStatus = "active" | "needs_attention" | "inactive";
export type CoachPlanStatus = "draft" | "active" | "completed" | "archived";
export type CoachPlanApprovalStatus = "not_required" | "pending_review" | "approved";
export type ExerciseDifficulty = "easy" | "moderate" | "hard";
export type ChallengeOutcome = "completed" | "partial" | "missed";

// ─── Base user shape used by coach-dashboard API data ─────────────────────────

interface CoachBaseUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface Coach extends CoachBaseUser {
  assignedTraineeIds: string[];
}

export interface Trainee extends CoachBaseUser {
  level: string;
  color: string;
  status: TraineeStatus;
  streakDays: number;
  completedChallenges: number;
  missedWorkouts: number;
  weeklyActivity: number[];
  goals: string[];
}

export interface CoachPlanExercise {
  id: string;
  order: number;
  name: string;
  sets?: number;
  reps?: string;
  durationSec?: number;
  restSec?: number;
  equipment: string;
  notes?: string;
}

export interface CoachPlanDay {
  id: string;
  dayNumber: number;
  title: string;
  restDay: boolean;
  durationMinutes: number;
  exercises: CoachPlanExercise[];
}

export interface CoachPlan {
  id: string;
  traineeId: string;
  traineeName: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  durationWeeks: number;
  workoutDaysPerWeek: number;
  equipment: string[];
  status: CoachPlanStatus;
  approvalStatus: CoachPlanApprovalStatus;
  requiresProfessionalReview: boolean;
  days: CoachPlanDay[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** Exercise shape sent to PUT /api/coach/plans/:planId — id is optional for new exercises. */
export interface CoachPlanExerciseUpdateBody {
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

/** Day shape sent to PUT /api/coach/plans/:planId — id is optional for new days. */
export interface CoachPlanDayUpdateBody {
  id?: string;
  dayNumber: number;
  title: string;
  restDay: boolean;
  durationMinutes: number;
  exercises: CoachPlanExerciseUpdateBody[];
}

export interface CoachPlanUpdateBody {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: number;
  durationWeeks?: number;
  workoutDaysPerWeek?: number;
  equipment?: string[];
  days?: CoachPlanDayUpdateBody[];
}

export interface GeneratePlanForTraineeBody {
  notes?: string;
  focusAreas?: string[];
  excludedExercises?: string[];
}

// ─── Change requests ──────────────────────────────────────────────────────────

export type WorkoutPlanChangeRequestStatus = "pending" | "resolved" | "rejected";

/** Used by the per-trainee detail page (existing). */
export interface WorkoutPlanChangeRequest {
  id: string;
  traineeId: string;
  traineeName: string;
  planId: string;
  planTitle: string;
  message: string;
  status: WorkoutPlanChangeRequestStatus;
  createdAt: string;
}

export interface ChangeRequestsResponse {
  success: boolean;
  changeRequests: WorkoutPlanChangeRequest[];
}

/** Used by the coach-level GET /change-requests endpoint. */
export interface CoachChangeRequestDTO {
  id: string;
  traineeId: string;
  traineeName: string;
  planId: string;
  planTitle: string;
  message: string;
  status: WorkoutPlanChangeRequestStatus;
  createdAt: string;
  reviewedAt?: string;
}

export interface CoachChangeRequestsResponse {
  requests: CoachChangeRequestDTO[];
  pendingCount: number;
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface CoachDashboardData {
  coach: Coach;
  trainees: Trainee[];
  pendingPlans: CoachPlan[];
}

export interface TraineeDetailsData {
  trainee: Trainee;
  plans: CoachPlan[];
}
