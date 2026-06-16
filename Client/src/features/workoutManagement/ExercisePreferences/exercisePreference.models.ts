export type ExercisePreferenceValue = "liked" | "disliked";

export type ExercisePreferenceReason =
  | "too_hard"
  | "too_easy"
  | "discomfort"
  | "unavailable_equipment"
  | "not_enjoyable"
  | "too_complex"
  | "other";

export interface ExercisePreference {
  id: string;
  exerciseKey: string;
  exerciseName: string;
  preference: ExercisePreferenceValue;
  reason?: ExercisePreferenceReason;
}

export interface SetExercisePreferenceBody {
  exerciseName: string;
  preference: ExercisePreferenceValue | null;
  reason?: ExercisePreferenceReason;
}

export const EXERCISE_PREFERENCE_REASON_LABELS: Record<ExercisePreferenceReason, string> = {
  too_hard: "Too hard",
  too_easy: "Too easy",
  discomfort: "Causes discomfort",
  unavailable_equipment: "Equipment unavailable",
  not_enjoyable: "Not enjoyable",
  too_complex: "Too complex",
  other: "Other",
};
