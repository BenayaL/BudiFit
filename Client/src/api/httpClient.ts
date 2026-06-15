// api — reusable HTTP wrapper used by all domain services.
// All fetch calls go through here so base URL, auth headers, and error handling
// are defined once and not duplicated across services.

import { env } from "../config/env";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${env.API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status} — ${path}`;

    try {
      const errorBody = (await response.json()) as {
        message?: string;
      };

      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // If the server did not return JSON, keep the default message.
    }

    throw new Error(message);
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/**
 * Fetches a binary response (e.g. a generated PDF) and returns it as a Blob.
 * Used for file downloads where the server responds with
 * Content-Type: application/pdf instead of JSON.
 */
async function requestBlob(
  path: string,
  token?: string
): Promise<Blob> {
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${env.API_BASE_URL}${path}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status} — ${path}`;

    try {
      const errorBody = (await response.json()) as {
        message?: string;
      };

      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // If the server did not return JSON, keep the default message.
    }

    throw new Error(message);
  }

  return response.blob();
}

export const httpClient = {
  get: <T>(path: string, token?: string) => request<T>("GET", path, undefined, token),
  post: <TResponse, TBody = unknown>(path: string, body: TBody, token?: string) =>
    request<TResponse>("POST", path, body, token),
  put: <TResponse, TBody = unknown>(path: string, body: TBody, token?: string) =>
    request<TResponse>("PUT", path, body, token),
  patch: <TResponse, TBody = unknown>(path: string, body: TBody, token?: string) =>
    request<TResponse>("PATCH", path, body, token),
  delete: <T>(path: string, token?: string) => request<T>("DELETE", path, undefined, token),
  getBlob: (path: string, token?: string) => requestBlob(path, token),
};