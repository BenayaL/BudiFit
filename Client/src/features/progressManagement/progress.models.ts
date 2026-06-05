// progressManagement — data contracts for workout history, streaks, analytics.

// ─── Primitive types ──────────────────────────────────────────────────────────

export type ProgressPeriod = "week" | "month" | "year" | "all_time";

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface ProgressSummary {
  userId: string;
  period: ProgressPeriod;
  totalWorkouts: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

export interface WorkoutHistoryItem {
  id: string;
  date: string;
  durationMinutes: number;
  challengeTitle: string;
}
