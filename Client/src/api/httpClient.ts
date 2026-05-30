// api = shared HTTP communication layer used by all feature services
// httpClient wraps fetch (or axios) so all requests share the same base URL,
// auth headers, and error handling in one place.

// import { env } from "../config/env";

// Base URL will come from env.ts once the backend is ready.
const BASE_URL = ""; // TODO: replace with env.API_BASE_URL

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      // TODO: attach Authorization header from auth state/store
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — ${path}`);
  }

  return response.json() as Promise<T>;
}

export const httpClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
