import { GoogleGenAI } from "@google/genai";

import {
  generatedWorkoutPlanResponseSchema,
  GeneratedWorkoutPlanResponse,
  validateGeneratedPlanForTrainee,
} from "../validation/generatedWorkoutPlan.validation";

/*
 * Only the trainee information required for workout generation.
 *
 * Do not pass the complete User document to this service.
 */
export interface WorkoutGenerationTraineeContext {
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  weeklyWorkouts: number;
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  availableEquipment: string[];
  medicalConditions: string[];
  medicalNotes?: string;
  preferredWorkoutTime?: string;
  sessionDurationMinutes?: number;
}

/*
 * Error types allow the route to return a suitable HTTP status
 * without exposing raw Gemini errors to the client.
 */
export type WorkoutGenerationErrorCode =
  | "AI_NOT_CONFIGURED"
  | "AI_RATE_LIMITED"
  | "AI_UNAVAILABLE"
  | "EMPTY_AI_RESPONSE"
  | "INVALID_AI_JSON"
  | "INVALID_AI_STRUCTURE"
  | "INVALID_AI_PLAN"
  | "AI_GENERATION_FAILED";

export class WorkoutGenerationError extends Error {
  code: WorkoutGenerationErrorCode;

  constructor(
    code: WorkoutGenerationErrorCode,
    message: string
  ) {
    super(message);

    this.name = "WorkoutGenerationError";
    this.code = code;
  }
}

// ── Minimal Gemini response schema ────────────────────────────────────────────
//
// Intentionally omits every constraint-generating property:
//   minimum, maximum, minItems, maxItems, minLength, maxLength, pattern, format
//
// Gemini returns 400 INVALID_ARGUMENT when the schema produces too many
// constraint states (e.g. nested arrays with bounds, integer ranges).
//
// All business rules are enforced by generatedWorkoutPlanResponseSchema (Zod)
// after the Gemini response is received — not before.

const EXERCISE_SCHEMA_FOR_GEMINI = {
  type: "object",
  required: ["order", "name", "equipment"],
  properties: {
    order:       { type: "integer" },
    name:        { type: "string"  },
    sets:        { type: "integer" },
    reps:        { type: "string"  },
    durationSec: { type: "integer" },
    restSec:     { type: "integer" },
    equipment:   { type: "string"  },
    notes:       { type: "string"  },
  },
};

const DAY_SCHEMA_FOR_GEMINI = {
  type: "object",
  required: ["dayNumber", "title", "restDay", "durationMinutes", "exercises"],
  properties: {
    dayNumber:       { type: "integer" },
    title:           { type: "string"  },
    restDay:         { type: "boolean" },
    durationMinutes: { type: "integer" },
    exercises: {
      type:  "array",
      items: EXERCISE_SCHEMA_FOR_GEMINI,
    },
  },
};

const GEMINI_WORKOUT_SCHEMA = {
  type: "object",
  required: [
    "title", "description", "category", "difficulty",
    "durationWeeks", "workoutDaysPerWeek", "equipment",
    "requiresProfessionalReview", "days",
  ],
  properties: {
    title:       { type: "string" },
    description: { type: "string" },
    category: {
      type: "string",
      enum: [
        "strength", "hypertrophy", "endurance",
        "general_fitness", "mobility", "weight_loss",
      ],
    },
    difficulty:               { type: "integer" },
    durationWeeks:            { type: "integer" },
    workoutDaysPerWeek:       { type: "integer" },
    equipment:                { type: "array", items: { type: "string" } },
    requiresProfessionalReview: { type: "boolean" },
    days: {
      type:  "array",
      items: DAY_SCHEMA_FOR_GEMINI,
    },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/*
 * Convert optional profile values into clear prompt text.
 */
function formatOptionalNumber(
  value: number | undefined,
  unit: string
): string {
  return value === undefined ? "Not provided" : `${value} ${unit}`;
}

/*
 * Returns true when Gemini rejected the request because the responseSchema
 * produced too many constraint states (400 INVALID_ARGUMENT).
 *
 * Used to decide whether to retry without responseJsonSchema.
 */
function isGeminiSchemaComplexityError(error: unknown): boolean {
  let text: string;

  if (error instanceof Error) {
    text = error.message;
  } else if (typeof error === "object" && error !== null) {
    try {
      text = JSON.stringify(error);
    } catch {
      text = String(error);
    }
  } else {
    text = String(error);
  }

  const lower = text.toLowerCase();
  return (
    lower.includes("too many states") ||
    (lower.includes("invalid_argument") && lower.includes("schema"))
  );
}

/*
 * Some Gemini errors include an HTTP status or status text,
 * but the exact object shape may vary between SDK versions.
 */
function readErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const possibleError = error as {
    status?: unknown;
    code?: unknown;
    response?: { status?: unknown };
  };

  if (typeof possibleError.status === "number") return possibleError.status;
  if (typeof possibleError.code   === "number") return possibleError.code;

  if (
    possibleError.response &&
    typeof possibleError.response.status === "number"
  ) {
    return possibleError.response.status;
  }

  return undefined;
}

/*
 * Convert unknown caught errors into a safe internal message.
 *
 * The complete raw error must not be sent to the client.
 */
function readErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/*
 * Build the generation prompt from the trainee profile.
 *
 * When includeSchemaNote is true (primary path), the prompt references the
 * provided responseJsonSchema.
 * When false (fallback path), the prompt embeds the expected JSON structure
 * in plain text so Gemini still knows the shape without a schema.
 *
 * The prompt never contains email, password, JWT, or MongoDB IDs.
 */
function buildWorkoutGenerationPrompt(
  trainee: WorkoutGenerationTraineeContext,
  includeSchemaNote: boolean
): string {
  const goals =
    trainee.goals.length > 0
      ? trainee.goals.join(", ")
      : "General fitness";

  const medicalConditions =
    trainee.medicalConditions.length > 0
      ? trainee.medicalConditions.join(", ")
      : "None reported";

  const structureNote = includeSchemaNote
    ? "The response must match the provided JSON schema exactly."
    : [
        "Return a single JSON object with these top-level fields:",
        "  title (string), description (string),",
        "  category (one of: strength, hypertrophy, endurance, general_fitness, mobility, weight_loss),",
        "  difficulty (integer 1-5), durationWeeks (integer 1-12), workoutDaysPerWeek (integer),",
        "  equipment (array of strings), requiresProfessionalReview (boolean),",
        "  days (array of day objects).",
        "Each day: dayNumber (integer), title (string), restDay (boolean),",
        "  durationMinutes (integer), exercises (array of exercise objects).",
        "Each exercise: order (integer), name (string), equipment (string),",
        "  and at least one of: sets (integer), reps (string), durationSec (integer).",
        "Optional exercise fields: restSec (integer), notes (string).",
      ].join("\n");

  const equipment =
    trainee.availableEquipment.length > 0
      ? trainee.availableEquipment.join(", ")
      : "bodyweight only";

  const medicalNotesLine =
    trainee.medicalNotes?.trim()
      ? `- Additional medical notes: ${trainee.medicalNotes.trim()}`
      : "";

  const sessionDurationLine =
    trainee.sessionDurationMinutes !== undefined
      ? `- Target session duration: ${trainee.sessionDurationMinutes} minutes`
      : "";

  const preferredTimeLine =
    trainee.preferredWorkoutTime
      ? `- Preferred workout time: ${trainee.preferredWorkoutTime}`
      : "";

  const medicalNote =
    medicalConditions === "None reported"
      ? "No limitations reported."
      : `Reported limitations: ${medicalConditions}. Consider these when selecting exercises — avoid or modify movements that may aggravate the listed conditions. Do not provide medical diagnosis or claim this plan replaces professional medical advice.`;

  return `
You are generating a personalized workout plan for the BudiFit application.

Create exactly one safe and realistic weekly workout plan based only on the trainee information below.

Trainee information:
- Fitness level: ${trainee.fitnessLevel}
- Goals: ${goals}
- Requested workout days per week: ${trainee.weeklyWorkouts}
- Age: ${formatOptionalNumber(trainee.age, "years")}
- Height: ${formatOptionalNumber(trainee.height, "cm")}
- Weight: ${formatOptionalNumber(trainee.weight, "kg")}
- Available equipment: ${equipment}
- Medical conditions or limitations: ${medicalNote}
${medicalNotesLine}
${sessionDurationLine}
${preferredTimeLine}

Equipment rules:
- ONLY use exercises that require equipment listed in the "Available equipment" line above.
- Do NOT assume the trainee has access to any other equipment.
- Do NOT silently add barbells, dumbbells, cables, machines, benches, racks, or bands if they are not listed.
- If a planned exercise requires unavailable equipment, replace it with a suitable bodyweight or available-equipment alternative.

Session duration rules:
- Each workout day durationMinutes should be as close as possible to the target session duration (if provided), accounting for warm-up, exercises, rest periods, and optional cool-down.

Rules:
1. workoutDaysPerWeek must be exactly ${trainee.weeklyWorkouts}.
2. The number of days where restDay is false must also be exactly ${trainee.weeklyWorkouts}.
3. dayNumber values must be unique.
4. exercise order values must be unique inside each day.
5. A workout day must contain at least one exercise.
6. A rest day must contain no exercises and durationMinutes must be 0.
7. Adapt the difficulty and exercise selection to the fitness level.
8. Adapt the plan to the listed goals.
9. For beginners, prefer simple and beginner-friendly movements and machines where appropriate.
10. Give each workout a realistic duration.
11. Every exercise must contain at least sets, reps, or durationSec.
12. Include suitable restSec values.
13. Do not diagnose, treat, cure, or make medical claims.
14. Do not recommend medications or supplements.
15. If the reported medical information may require professional approval, set requiresProfessionalReview to true.
16. When requiresProfessionalReview is true, keep the exercises conservative and include a short review warning in the description.
17. Do not include fields that are not part of the required schema.
18. Return JSON only. Do not return Markdown, code fences, explanations, or text before or after the JSON.

${structureNote}
`.trim();
}

// ── Main export ───────────────────────────────────────────────────────────────

/*
 * Generate, parse, and validate one workout plan.
 *
 * Flow:
 *   1. Call Gemini with a minimal responseJsonSchema (no bounds).
 *   2. If Gemini rejects the schema as too complex, retry once with
 *      responseMimeType only and an explicit JSON-structure prompt.
 *   3. Parse the response.
 *   4. Validate with the full Zod schema.
 *   5. Validate against the trainee profile.
 *   6. Return the validated plan.
 *
 * Does not save anything to MongoDB — the caller (route) handles that.
 */
export async function generatePersonalizedWorkoutPlan(
  trainee: WorkoutGenerationTraineeContext
): Promise<GeneratedWorkoutPlanResponse> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new WorkoutGenerationError(
      "AI_NOT_CONFIGURED",
      "AI workout generation is not configured"
    );
  }

  const model =
    process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log("[WORKOUT_GEN] Gemini workout generation started");

    // ── Step 1: Gemini API call ────────────────────────────────────────────────
    //
    // Primary attempt uses the minimal GEMINI_WORKOUT_SCHEMA.
    // If Gemini returns 400 "too many states", fall back to responseMimeType
    // only (no responseJsonSchema) with an explicit structure description
    // in the prompt.

    let rawResponseText: string | undefined;

    try {
      const result = await ai.models.generateContent({
        model,
        contents: buildWorkoutGenerationPrompt(trainee, true),
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: GEMINI_WORKOUT_SCHEMA,
        },
      });

      rawResponseText = result.text?.trim();
    } catch (primaryError) {
      if (isGeminiSchemaComplexityError(primaryError)) {
        console.warn(
          "[WORKOUT_GEN] Gemini rejected responseJsonSchema (schema too complex) — " +
          "retrying with responseMimeType only"
        );

        const fallbackResult = await ai.models.generateContent({
          model,
          contents: buildWorkoutGenerationPrompt(trainee, false),
          config: { responseMimeType: "application/json" },
        });

        rawResponseText = fallbackResult.text?.trim();
      } else {
        // Not a schema-complexity error — re-throw for the outer catch.
        throw primaryError;
      }
    }

    console.log("[WORKOUT_GEN] Gemini response received");

    // ── Step 2: Parse ─────────────────────────────────────────────────────────

    if (!rawResponseText) {
      throw new WorkoutGenerationError(
        "EMPTY_AI_RESPONSE",
        "Gemini returned an empty workout plan"
      );
    }

    let parsedResponse: unknown;

    try {
      parsedResponse = JSON.parse(rawResponseText);
    } catch {
      // Do not log the raw text — it may contain trainee medical information.
      console.error(
        "[WORKOUT_GEN] Gemini returned invalid JSON"
      );

      throw new WorkoutGenerationError(
        "INVALID_AI_JSON",
        "Gemini returned invalid JSON"
      );
    }

    console.log("[WORKOUT_GEN] Gemini response parsed");

    // ── Step 3: Full Zod validation ───────────────────────────────────────────

    const validationResult =
      generatedWorkoutPlanResponseSchema.safeParse(parsedResponse);

    if (!validationResult.success) {
      // Log only paths and messages — not the raw response body.
      console.error(
        "[WORKOUT_GEN] Zod validation failed:",
        validationResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }))
      );

      throw new WorkoutGenerationError(
        "INVALID_AI_STRUCTURE",
        "Gemini returned a workout plan with an invalid structure"
      );
    }

    console.log("[WORKOUT_GEN] Gemini response validated");

    // ── Step 4: Trainee-profile validation ────────────────────────────────────

    try {
      const plan = validateGeneratedPlanForTrainee(
        validationResult.data,
        trainee.weeklyWorkouts
      );

      console.log("[WORKOUT_GEN] Generated workout plan ready to save");

      return plan;
    } catch (error) {
      console.error(
        "[WORKOUT_GEN] Trainee validation failed:",
        readErrorMessage(error)
      );

      throw new WorkoutGenerationError(
        "INVALID_AI_PLAN",
        "The generated workout plan does not match the trainee profile"
      );
    }
  } catch (error) {
    // Preserve errors that were already classified above.
    if (error instanceof WorkoutGenerationError) {
      throw error;
    }

    const status = readErrorStatus(error);
    const errorMessage = readErrorMessage(error).toLowerCase();

    // Gemini quota or rate-limit errors.
    if (
      status === 429 ||
      errorMessage.includes("resource_exhausted") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("rate limit")
    ) {
      console.error("[WORKOUT_GEN] Rate limit reached");

      throw new WorkoutGenerationError(
        "AI_RATE_LIMITED",
        "AI workout generation is temporarily rate limited"
      );
    }

    // Temporary Gemini availability errors.
    if (
      status === 503 ||
      status === 502 ||
      errorMessage.includes("unavailable") ||
      errorMessage.includes("high demand")
    ) {
      console.error("[WORKOUT_GEN] Gemini service unavailable");

      throw new WorkoutGenerationError(
        "AI_UNAVAILABLE",
        "AI workout generation is temporarily unavailable"
      );
    }

    console.error(
      "[WORKOUT_GEN] Unexpected error:",
      readErrorMessage(error)
    );

    throw new WorkoutGenerationError(
      "AI_GENERATION_FAILED",
      "Failed to generate workout plan"
    );
  }
}

export default {
  generatePersonalizedWorkoutPlan,
};
