// progressManagement — service layer for workout history and analytics API calls.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";
import type { ProgressSummary, WorkoutHistoryItem } from "./progress.models";

export const progressService = {
  getProgressDashboard: (token: string): Promise<ProgressSummary> =>
    httpClient.get<ProgressSummary>(ENDPOINTS.progress.dashboard, token),

  getWorkoutHistory: (token: string): Promise<WorkoutHistoryItem[]> =>
  httpClient.get<WorkoutHistoryItem[]>(ENDPOINTS.progress.history, token),
};
