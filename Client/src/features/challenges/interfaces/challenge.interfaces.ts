// features/challenges — interfaces = TypeScript structures that belong to the challenges feature

import type { ChallengeStatus, DifficultyLevel } from "../types/challenge.types";

// DailyChallenge describes the shape of a challenge returned by the backend.
export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  status: ChallengeStatus;
  durationMinutes: number;
  createdAt: string;
}
