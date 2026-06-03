// features/coach — types = small union/string types for the coach feature

export type TraineeStatus = "active" | "attention" | "new";
export type PlanStatus = "pending_approval" | "approved" | "rejected";
export type ChallengeOutcome = "completed" | "partial" | "missed";
export type ExerciseDifficulty = "easy" | "moderate" | "hard";