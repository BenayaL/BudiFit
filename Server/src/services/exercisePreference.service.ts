import mongoose from "mongoose";
import ExercisePreference from "../models/exercisePreference.model";

export interface GeminiExercisePreferences {
  likedExercises: string[];
  dislikedExercises: Array<{ name: string; reason?: string }>;
}

/**
 * Loads a trainee's exercise preferences in the shape Gemini's prompt
 * builder expects. Used by every generation entry point (trainee generate,
 * trainee replace, coach generate) so they never drift apart.
 */
export async function loadGeminiExercisePreferences(
  userId: string | mongoose.Types.ObjectId
): Promise<GeminiExercisePreferences> {
  const preferences = await ExercisePreference.find({ userId });

  const likedExercises = preferences
    .filter((p) => p.preference === "liked")
    .map((p) => p.exerciseName);

  const dislikedExercises = preferences
    .filter((p) => p.preference === "disliked")
    .map((p) => ({ name: p.exerciseName, reason: p.reason }));

  return { likedExercises, dislikedExercises };
}
