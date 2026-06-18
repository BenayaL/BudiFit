import { GoogleGenAI } from "@google/genai";

import type {
    IGeneratedWorkoutExercise,
    IGeneratedWorkoutProfileSnapshot,
} from "../models/generatedWorkoutPlan.model";

export interface ExerciseAlternative {
    name: string;
    equipment: string;
    reason: string;
    suggestedTarget: string;
    notes?: string;
}

export interface ExerciseAlternativesContext {
    exercise: IGeneratedWorkoutExercise;
    dayTitle: string;
    planCategory: string;
    planDifficulty: number;
    profileSnapshot: IGeneratedWorkoutProfileSnapshot;
}

function buildAlternativesPrompt(ctx: ExerciseAlternativesContext): string {
    const { exercise, dayTitle, planCategory, planDifficulty, profileSnapshot } = ctx;

    const equipment =
        profileSnapshot.availableEquipment.length > 0
            ? profileSnapshot.availableEquipment.join(", ")
            : "bodyweight only";

    const medicalConditions =
        profileSnapshot.medicalConditions.length > 0
            ? profileSnapshot.medicalConditions.join(", ")
            : "none";

    const targetParts: string[] = [];
    if (exercise.sets !== undefined && exercise.reps) targetParts.push(`${exercise.sets} × ${exercise.reps}`);
    else if (exercise.reps) targetParts.push(exercise.reps);
    if (exercise.durationSec !== undefined) targetParts.push(`${exercise.durationSec} sec`);
    if (exercise.restSec !== undefined) targetParts.push(`rest ${exercise.restSec} sec`);
    const target = targetParts.join(", ") || "no specific target";

    return `You are a certified fitness coach assistant for BudiFit.

Suggest 3-5 safe alternative exercises for the following exercise.

Exercise to replace:
- Name: ${exercise.name}
- Equipment: ${exercise.equipment || "none"}
- Target: ${target}
- Notes: ${exercise.notes || "none"}
- Workout day: ${dayTitle}
- Plan category: ${planCategory}
- Plan difficulty: ${planDifficulty}/5

Trainee profile:
- Fitness level: ${profileSnapshot.fitnessLevel}
- Available equipment: ${equipment}
- Medical conditions: ${medicalConditions}

Rules:
1. Alternatives must train a similar muscle group or movement pattern.
2. Prefer exercises using the trainee's available equipment.
3. Avoid exercises that are unsafe for reported medical conditions.
4. Adapt to the trainee's fitness level and plan difficulty.
5. Keep reason and notes short (1-2 sentences max).
6. Return valid JSON only. No markdown. No code fences. No text outside JSON.

Return a JSON array:
[
  {
    "name": "Exercise Name",
    "equipment": "equipment needed or none",
    "reason": "why this is a good alternative",
    "suggestedTarget": "e.g. 3 × 10 or 30 sec",
    "notes": "optional short tip"
  }
]`.trim();
}

export async function getExerciseAlternatives(
    ctx: ExerciseAlternativesContext
): Promise<ExerciseAlternative[]> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        throw new Error("AI exercise alternatives are not configured");
    }

    const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
        model,
        contents: buildAlternativesPrompt(ctx),
        config: { responseMimeType: "application/json" },
    });

    const rawText = result.text?.trim();
    if (!rawText) {
        throw new Error("AI returned an empty response");
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawText);
    } catch {
        throw new Error("AI returned invalid JSON for exercise alternatives");
    }

    if (!Array.isArray(parsed)) {
        throw new Error("AI returned unexpected structure for exercise alternatives");
    }

    const alternatives: ExerciseAlternative[] = [];
    for (const item of parsed) {
        if (
            typeof item === "object" &&
            item !== null &&
            typeof (item as Record<string, unknown>).name === "string" &&
            typeof (item as Record<string, unknown>).equipment === "string" &&
            typeof (item as Record<string, unknown>).reason === "string" &&
            typeof (item as Record<string, unknown>).suggestedTarget === "string"
        ) {
            const alt = item as Record<string, unknown>;
            alternatives.push({
                name: alt.name as string,
                equipment: alt.equipment as string,
                reason: alt.reason as string,
                suggestedTarget: alt.suggestedTarget as string,
                notes: typeof alt.notes === "string" ? alt.notes : undefined,
            });
        }
    }

    if (alternatives.length === 0) {
        throw new Error("AI returned no valid alternatives");
    }

    return alternatives;
}
