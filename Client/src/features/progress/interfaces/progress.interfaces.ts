// features/progress — interfaces = TypeScript structures that belong to the progress feature

import type { ProgressPeriod } from "../types/progress.types";

// ProgressSummary is the aggregated stats shown on the user's dashboard.
export interface ProgressSummary {
  userId: string;
  period: ProgressPeriod;
  totalWorkouts: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

// WorkoutHistoryItem represents one completed workout session.
export interface WorkoutHistoryItem {
  id: string;
  date: string;
  durationMinutes: number;
  challengeTitle: string;
}
