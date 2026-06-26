// Shared export service — used by workoutManagement and progressManagement.
// Thin HTTP wrappers only; no UI logic.

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
    httpClient.get<ExportEmailResponse>(ENDPOINTS.export.email, token),

  // ── Workout plan ──────────────────────────────────────────────────────────

  downloadWorkoutPlanPdf: (planId: string, token: string): Promise<Blob> => {
    if (!planId) return Promise.reject(new Error("planId is required"));
    return httpClient.getBlob(ENDPOINTS.export.workoutPlanPdf(planId), token);
  },

  emailWorkoutPlan: (planId: string, token: string): Promise<ExportEmailResponse> => {
    if (!planId) return Promise.reject(new Error("planId is required"));
    return httpClient.get<ExportEmailResponse>(ENDPOINTS.export.workoutPlanEmail(planId), token);
  },

  // ── Workout history ───────────────────────────────────────────────────────

  downloadWorkoutHistoryPdf: (token: string): Promise<Blob> =>
    httpClient.getBlob(ENDPOINTS.export.workoutHistoryPdf, token),

  emailWorkoutHistory: (token: string): Promise<ExportEmailResponse> =>
    httpClient.get<ExportEmailResponse>(ENDPOINTS.export.workoutHistoryEmail, token),

  // ── Daily workout (single session) ───────────────────────────────────────

  downloadDailyWorkoutPdf: (planId: string, date: string, token: string): Promise<Blob> => {
    if (!planId) return Promise.reject(new Error("planId is required"));
    if (!date) return Promise.reject(new Error("date is required"));
    return httpClient.getBlob(ENDPOINTS.export.dailyWorkoutPdf(planId, date), token);
  },

  emailDailyWorkout: (planId: string, date: string, token: string): Promise<ExportEmailResponse> => {
    if (!planId) return Promise.reject(new Error("planId is required"));
    if (!date) return Promise.reject(new Error("date is required"));
    return httpClient.get<ExportEmailResponse>(ENDPOINTS.export.dailyWorkoutEmail(planId, date), token);
  },
};
