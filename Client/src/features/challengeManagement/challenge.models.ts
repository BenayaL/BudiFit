// challengeManagement — data contracts for daily and weekly challenges.

// ─── Primitive types ──────────────────────────────────────────────────────────

export type ChallengeStatus = "pending" | "in_progress" | "completed" | "skipped";
export type DifficultyLevel = "easy" | "medium" | "hard";

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  status: ChallengeStatus;
  durationMinutes: number;
  createdAt: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  daysCompleted: number;
  totalDays: number;
}

export interface ChallengeHistoryItem {
  id: string;
  title: string;
  completedAt: string;
  durationMinutes: number;
}
