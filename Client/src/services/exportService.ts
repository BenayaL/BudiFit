// Shared export service — used by workoutManagement and progressManagement.
// Thin HTTP wrappers only; no UI logic.
// PDF downloads are GET. Email sends are POST (side effect).

import { httpClient } from "../api/httpClient";
import { ENDPOINTS } from "../api/endpoints";

export interface ExportEmailResponse {
  message: string;
}

export const exportService = {
  // ── Progress Dashboard ────────────────────────────────────────────────────

  downloadPdf: (token: string): Promise<Blob> =>
    httpClient.getBlob(ENDPOINTS.export.pdf, token),

  sendByEmail: (token: string): Promise<ExportEmailResponse> =>
    httpClient.post<ExportEmailResponse, Record<string, never>>(ENDPOINTS.export.email, {}, token),

  // ── Workout plan ──────────────────────────────────────────────────────────

  downloadWorkoutPlanPdf: (planId: string, token: string): Promise<Blob> => {
    if (!planId) return Promise.reject(new Error("planId is required"));
    return httpClient.getBlob(ENDPOINTS.export.workoutPlanPdf(planId), token);
  },

  emailWorkoutPlan: (planId: string, token: string): Promise<ExportEmailResponse> => {
    if (!planId) return Promise.reject(new Error("planId is required"));
    return httpClient.post<ExportEmailResponse, Record<string, never>>(
      ENDPOINTS.export.workoutPlanEmail(planId),
      {},
      token
    );
  },

  // ── Workout history ───────────────────────────────────────────────────────

  downloadWorkoutHistoryPdf: (token: string): Promise<Blob> =>
    httpClient.getBlob(ENDPOINTS.export.workoutHistoryPdf, token),

  emailWorkoutHistory: (token: string): Promise<ExportEmailResponse> =>
    httpClient.post<ExportEmailResponse, Record<string, never>>(
      ENDPOINTS.export.workoutHistoryEmail,
      {},
      token
    ),

  // ── Daily workout (single session) ───────────────────────────────────────

  downloadDailyWorkoutPdf: (planId: string, date: string, token: string): Promise<Blob> => {
    if (!planId) return Promise.reject(new Error("planId is required"));
    if (!date) return Promise.reject(new Error("date is required"));
    return httpClient.getBlob(ENDPOINTS.export.dailyWorkoutPdf(planId, date), token);
  },

  emailDailyWorkout: (planId: string, date: string, token: string): Promise<ExportEmailResponse> => {
    if (!planId) return Promise.reject(new Error("planId is required"));
    if (!date) return Promise.reject(new Error("date is required"));
    return httpClient.post<ExportEmailResponse, Record<string, never>>(
      ENDPOINTS.export.dailyWorkoutEmail(planId, date),
      {},
      token
    );
  },
};
