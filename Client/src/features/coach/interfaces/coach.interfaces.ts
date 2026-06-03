// features/coach — interfaces = object shapes for the coach feature
// Coach and Trainee both extend the base User interface from the user feature.

import type { User } from "../../user/interfaces/user.interfaces";
import type {TraineeStatus,PlanStatus,ExerciseDifficulty,} from "../types/coach.types";

// Coach IS-A User, plus the list of trainees assigned to them.
export interface Coach extends User {
  assignedTraineeIds: string[];
}

// Trainee IS-A User, plus the coaching/progress data the coach sees.
export interface Trainee extends User {
  color: string;
  status: TraineeStatus;
  streakDays: number;
  completedChallenges: number;
  missedWorkouts: number;
  weeklyActivity: number[];
  goals: string[];
}

// One exercise inside a plan the coach reviews.
export interface PlanExercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  durationSec?: number;
  equipment: string;
  difficulty: ExerciseDifficulty;
}

// A workout plan that needs the coach's approval.
export interface CoachPlan {
  id: string;
  traineeId: string;
  traineeName: string;
  title: string;
  status: PlanStatus;
  exercises: PlanExercise[];
}