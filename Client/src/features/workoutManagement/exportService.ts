// workoutManagement — service layer for workout summary export.
// PDF generation and email delivery are handled server-side.
// These methods are stubs until the backend endpoints are connected.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";

export interface ExportEmailRequest {
  email: string;
}

export interface ExportPdfResponse {
  downloadUrl: string;   // backend returns a signed S3 / blob URL
}

export const exportService = {
  /**
   * Asks the server to generate a PDF summary and returns a download URL.
   * TODO: connect when backend is ready.
   */
  downloadPdf: (token: string): Promise<ExportPdfResponse> =>
    httpClient.get<ExportPdfResponse>(ENDPOINTS.export.pdf, token),

  /**
   * Asks the server to email the workout summary to the given address.
   * TODO: connect when backend is ready.
   */
  sendByEmail: (data: ExportEmailRequest, token: string): Promise<void> =>
    httpClient.post<void, ExportEmailRequest>(ENDPOINTS.export.email, data, token),
};