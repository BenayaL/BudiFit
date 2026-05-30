// features/challenges — types = TypeScript structures that belong to the challenges feature

// ChallengeStatus represents the state of today's challenge.
export type ChallengeStatus = "pending" | "in_progress" | "completed" | "skipped";

// DifficultyLevel describes how hard the challenge is.
export type DifficultyLevel = "easy" | "medium" | "hard";
