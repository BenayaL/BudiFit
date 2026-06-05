// challengeManagement — service layer for daily and weekly challenge API calls.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";
import type { DailyChallenge, WeeklyChallenge, ChallengeHistoryItem } from "./challenge.models";

export const challengeService = {
  getTodayChallenge: (token: string): Promise<DailyChallenge> =>
    httpClient.get<DailyChallenge>(ENDPOINTS.challenges.today, token),

  getWeeklyChallenges: (token: string): Promise<WeeklyChallenge[]> =>
    httpClient.get<WeeklyChallenge[]>(ENDPOINTS.challenges.weekly, token),

  getChallengeHistory: (token: string): Promise<ChallengeHistoryItem[]> =>
    httpClient.get<ChallengeHistoryItem[]>(ENDPOINTS.challenges.history, token),

  completeChallenge: (challengeId: string, token: string): Promise<void> =>
    httpClient.post<void>(ENDPOINTS.challenges.complete(challengeId), {}, token),
};
