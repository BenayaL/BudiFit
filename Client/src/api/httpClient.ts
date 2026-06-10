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

  let response: Response;

  try {
    response = await fetch(`${env.API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError: unknown) {
    const message =
      networkError instanceof Error ? networkError.message : "Network error";
    if (env.IS_DEV) {
      console.error(`[HTTP] Network failure — ${method} ${path}:`, message);
    }
    throw new Error(`Network error: ${message}`, { cause: networkError });
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    let serverMessage: string | undefined;
    let errorDetail: string | undefined;

    try {
      if (contentType.includes("application/json")) {
        const errorBody = (await response.json()) as {
          message?: string;
          error?: string;
        };
        serverMessage = errorBody.message;
        errorDetail = errorBody.error;
      } else if (contentType.includes("text/")) {
        const text = await response.text();
        // Truncate large HTML error pages — keep only the first line.
        if (text) serverMessage = text.split("\n")[0]?.slice(0, 200);
      }
    } catch {
      // Could not parse response body — keep defaults.
    }

    if (env.IS_DEV) {
      console.error(
        `[HTTP] ${method} ${path} → ${response.status} ${response.statusText}`,
        {
          isJSON: contentType.includes("application/json"),
          serverMessage,
          errorDetail,
        }
      );
    }

    throw new Error(
      errorDetail ?? serverMessage ?? `HTTP ${response.status} — ${path}`
    );
  }

  // 204 No Content — nothing to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const httpClient = {
  get: <T>(path: string, token?: string) =>
    request<T>("GET", path, undefined, token),
  post: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    token?: string
  ) => request<TResponse>("POST", path, body, token),
  put: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    token?: string
  ) => request<TResponse>("PUT", path, body, token),
  patch: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    token?: string
  ) => request<TResponse>("PATCH", path, body, token),
  delete: <T>(path: string, token?: string) =>
    request<T>("DELETE", path, undefined, token),
};
