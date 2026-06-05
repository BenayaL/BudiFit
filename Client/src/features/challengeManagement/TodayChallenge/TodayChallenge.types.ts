import type { DailyChallenge } from "../challenge.models";

export interface TodayChallengeState {
  challenge: DailyChallenge | null;
  isLoading: boolean;
  error: string;
}
