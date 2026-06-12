// workoutManagement — service layer for workout summary export.
// PDF generation and email delivery are handled server-side.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";

export interface ExportEmailResponse {
  message: string;
}

export const exportService = {
  /**
   * Downloads the generated workout summary PDF as a Blob.
   * The caller is responsible for turning this into a download
   * link or a Web Share file.
   */
  downloadPdf: (token: string): Promise<Blob> =>
    httpClient.getBlob(ENDPOINTS.export.pdf, token),

  /**
   * Asks the server to generate the PDF and email it to the
   * authenticated user's address.
   */
  sendByEmail: (token: string): Promise<ExportEmailResponse> =>
    httpClient.get<ExportEmailResponse>(ENDPOINTS.export.email, token),
};