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
    throw new Error(`HTTP ${response.status} — ${path}`);
  }

  return response.json() as Promise<T>;
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
};
