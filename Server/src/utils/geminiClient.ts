// Thin REST client for the Gemini Generative Language API.
// Talks to the API directly (instead of going through the @google/genai SDK)
// so we have full control over auth header vs query param, response parsing,
// and model-list based fallback/diagnostics.

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-flash-latest";

interface GeminiModel {
  name: string; // e.g. "models/gemini-2.5-flash"
  supportedGenerationMethods?: string[];
}

interface RawGeminiResponse {
  ok: boolean;
  status: number;
  isJson: boolean;
  body: unknown;
  sanitizedErrorText?: string;
}

/** Redacts anything that looks like an API key before it is ever logged. */
function redactSecrets(text: string): string {
  return text
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, "[REDACTED]")
    .replace(/AQ\.[0-9A-Za-z_.-]{10,}/g, "[REDACTED]");
}

async function rawRequest(url: string, init: RequestInit): Promise<RawGeminiResponse> {
  const res = await fetch(url, init);
  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const text = await res.text();

  if (res.ok) {
    return {
      ok: true,
      status: res.status,
      isJson,
      body: isJson ? JSON.parse(text) : text,
    };
  }

  let sanitizedErrorText: string;
  if (isJson) {
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      sanitizedErrorText = redactSecrets(parsed.error?.message ?? "Unknown error");
    } catch {
      sanitizedErrorText = redactSecrets(text).slice(0, 300);
    }
  } else {
    // HTML or plain-text error page — never forward raw markup, just a
    // truncated, sanitized snippet for diagnostics.
    sanitizedErrorText = redactSecrets(text).slice(0, 300);
  }

  return { ok: false, status: res.status, isJson, body: text, sanitizedErrorText };
}

/**
 * GET /v1beta/models — used purely as a diagnostic / fallback-source when the
 * primary and fallback models both fail. Logs status + content-type + a
 * sanitized error message; never logs the API key.
 */
export async function listModels(apiKey: string): Promise<{
  ok: boolean;
  status: number;
  models: GeminiModel[];
  sanitizedErrorText?: string;
}> {
  const result = await rawRequest(`${GEMINI_BASE}/models`, {
    method: "GET",
    headers: { "x-goog-api-key": apiKey },
  });

  console.log("[GEMINI] listModels", {
    status: result.status,
    isJson: result.isJson,
    ...(result.sanitizedErrorText ? { error: result.sanitizedErrorText } : {}),
  });

  if (!result.ok) {
    return { ok: false, status: result.status, models: [], sanitizedErrorText: result.sanitizedErrorText };
  }

  const models = (result.body as { models?: GeminiModel[] }).models ?? [];
  return { ok: true, status: result.status, models };
}

function shortModelName(fullName: string): string {
  return fullName.startsWith("models/") ? fullName.slice("models/".length) : fullName;
}

interface GenerateAttempt {
  ok: boolean;
  status: number;
  isJson: boolean;
  text?: string;
  sanitizedErrorText?: string;
}

async function callGenerateContent(model: string, apiKey: string, prompt: string): Promise<GenerateAttempt> {
  const result = await rawRequest(`${GEMINI_BASE}/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  console.log("[GEMINI] generateContent", {
    model,
    status: result.status,
    isJson: result.isJson,
    ...(result.sanitizedErrorText ? { error: result.sanitizedErrorText } : {}),
  });

  if (!result.ok) {
    return { ok: false, status: result.status, isJson: result.isJson, sanitizedErrorText: result.sanitizedErrorText };
  }

  const body = result.body as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  return { ok: true, status: result.status, isJson: result.isJson, text };
}

export interface GeminiReplyResult {
  ok: boolean;
  text?: string;
  status?: number;
  message?: string;
}

/** User-facing message for a failed Gemini call, derived from the HTTP status. */
function describeFailure(status: number, sanitizedErrorText?: string): string {
  switch (status) {
    case 403:
      return "Gemini API access forbidden from this server environment.";
    case 429:
      return "Gemini quota exceeded.";
    case 404:
      return "Gemini model not found.";
    default:
      return sanitizedErrorText
        ? `Gemini request failed (${status}): ${sanitizedErrorText}`
        : `Gemini request failed (${status}).`;
  }
}

/**
 * Generates a reply, trying gemini-2.5-flash first. On 403/404 (access or
 * model-availability issues — not quota) it retries with gemini-flash-latest,
 * then falls back to the first model list can find with generateContent
 * support. If model listing itself fails the same way, that confirms the
 * problem is the API key / Google Cloud project / Render's network egress,
 * not this application's code.
 */
export async function generateBudiReply(apiKey: string, prompt: string): Promise<GeminiReplyResult> {
  const primary = await callGenerateContent(PRIMARY_MODEL, apiKey, prompt);
  if (primary.ok) return { ok: true, text: primary.text };

  // Quota errors and anything else are model-independent — no point falling
  // back to a different model, surface the mapped message directly.
  if (primary.status !== 403 && primary.status !== 404) {
    return { ok: false, status: primary.status, message: describeFailure(primary.status, primary.sanitizedErrorText) };
  }

  const fallback = await callGenerateContent(FALLBACK_MODEL, apiKey, prompt);
  if (fallback.ok) return { ok: true, text: fallback.text };

  if (fallback.status !== 403 && fallback.status !== 404) {
    return { ok: false, status: fallback.status, message: describeFailure(fallback.status, fallback.sanitizedErrorText) };
  }

  // Both fixed models failed with access/availability errors — ask Google
  // what models this key can actually see.
  const list = await listModels(apiKey);
  if (!list.ok) {
    // Model listing failing with the same class of error confirms this is a
    // Google API key / Cloud project / Render environment access issue, not
    // application code.
    console.error("[GEMINI] Model listing failed the same way as generateContent — key/project/environment issue, not app code.");
    return {
      ok: false,
      status: list.status,
      message: describeFailure(list.status, list.sanitizedErrorText),
    };
  }

  const tried = new Set([PRIMARY_MODEL, FALLBACK_MODEL]);
  const candidate = list.models.find(
    (m) =>
      m.supportedGenerationMethods?.includes("generateContent") &&
      !tried.has(shortModelName(m.name))
  );

  if (!candidate) {
    return { ok: false, status: 404, message: describeFailure(404) };
  }

  const discovered = await callGenerateContent(shortModelName(candidate.name), apiKey, prompt);
  if (discovered.ok) return { ok: true, text: discovered.text };

  return {
    ok: false,
    status: discovered.status,
    message: describeFailure(discovered.status, discovered.sanitizedErrorText),
  };
}
