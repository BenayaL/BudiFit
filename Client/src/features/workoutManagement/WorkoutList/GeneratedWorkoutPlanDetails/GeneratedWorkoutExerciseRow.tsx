import { useState } from "react";

import type { GeneratedWorkoutExercise, ExerciseAlternative } from "../../workout.models";
import type { ExercisePreferenceReason, ExercisePreferenceValue } from "../../ExercisePreferences/exercisePreference.models";
import { ExercisePreferenceButtons } from "../../ExercisePreferences/ExercisePreferenceButtons";
import { workoutService } from "../../workoutService";

interface GeneratedWorkoutExerciseRowProps {
  exercise: GeneratedWorkoutExercise;
  planId: string;
  dayNumber: number;
  managedByCoach: boolean;
  token: string | null;
  preference?: ExercisePreferenceValue;
  onSetPreference?: (
    preference: ExercisePreferenceValue | null,
    reason?: ExercisePreferenceReason
  ) => void;
}

function buildExerciseTarget(
  exercise: GeneratedWorkoutExercise
): string {
  if (
    exercise.sets !== undefined &&
    exercise.reps
  ) {
    return `${exercise.sets} × ${exercise.reps}`;
  }

  if (exercise.reps) {
    return exercise.reps;
  }

  if (exercise.durationSec !== undefined) {
    return `${exercise.durationSec} sec`;
  }

  if (exercise.sets !== undefined) {
    return `${exercise.sets} sets`;
  }

  return "";
}

function AlternativeCard({ alt }: { alt: ExerciseAlternative }) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50 p-3 dark:border-purple-800/40 dark:bg-purple-900/20">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-slate-900 dark:text-[#F8F7FB]">{alt.name}</span>

        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
          {alt.suggestedTarget}
        </span>
      </div>

      {alt.equipment && alt.equipment !== "none" && (
        <p className="mt-1 text-xs text-slate-500 dark:text-[#9E97AF]">{alt.equipment}</p>
      )}

      <p className="mt-1 text-sm text-slate-600 dark:text-[#C9C4D6]">{alt.reason}</p>

      {alt.notes && (
        <p className="mt-1 text-xs text-slate-500 dark:text-[#9E97AF]">{alt.notes}</p>
      )}
    </div>
  );
}

export function GeneratedWorkoutExerciseRow({
  exercise,
  planId,
  dayNumber,
  managedByCoach,
  token,
  preference,
  onSetPreference,
}: GeneratedWorkoutExerciseRowProps) {
  const exerciseTarget = buildExerciseTarget(exercise);

  const [alternatives, setAlternatives] = useState<ExerciseAlternative[] | null>(null);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [alternativesError, setAlternativesError] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const canShowAlternatives = !managedByCoach && !!token;

  async function handleAlternativesClick() {
    if (showAlternatives) {
      setShowAlternatives(false);
      return;
    }

    if (alternatives !== null) {
      setShowAlternatives(true);
      return;
    }

    setIsLoadingAlternatives(true);
    setAlternativesError(null);

    try {
      const response = await workoutService.getExerciseAlternatives(
        planId,
        { dayNumber, exerciseOrder: exercise.order },
        token!
      );
      setAlternatives(response.alternatives);
      setShowAlternatives(true);
    } catch {
      setAlternativesError("Could not load alternatives. Please try again.");
    } finally {
      setIsLoadingAlternatives(false);
    }
  }

  return (
    <div className="border-t border-slate-200 px-5 py-4 first:border-t-0 dark:border-[#3B344A]">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-extrabold text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
          {String(exercise.order).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-[#F8F7FB]">
                {exercise.name}
              </h4>

              {exercise.equipment &&
                exercise.equipment !== "none" && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#9E97AF]">
                    Equipment: {exercise.equipment}
                  </p>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {exerciseTarget && (
                <div className="text-base font-extrabold text-slate-900 dark:text-[#F8F7FB]">
                  {exerciseTarget}
                </div>
              )}
              {onSetPreference && (
                <ExercisePreferenceButtons
                  exerciseName={exercise.name}
                  preference={preference}
                  onSetPreference={onSetPreference}
                />
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {exercise.restSec !== undefined && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-[#2A2436] dark:text-[#9E97AF]">
                Rest: {exercise.restSec} sec
              </span>
            )}

            {exercise.durationSec !== undefined &&
              exercise.sets !== undefined && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-[#2A2436] dark:text-[#9E97AF]">
                  Duration: {exercise.durationSec} sec
                </span>
              )}
          </div>

          {exercise.notes && (
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-[#9E97AF]">
              {exercise.notes}
            </p>
          )}

          {canShowAlternatives && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => void handleAlternativesClick()}
                disabled={isLoadingAlternatives}
                className="rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-50 disabled:opacity-60 dark:border-purple-800/40 dark:bg-[#2A2436] dark:text-purple-300 dark:hover:bg-purple-900/20"
              >
                {isLoadingAlternatives
                  ? "Loading..."
                  : showAlternatives
                  ? "Hide alternatives"
                  : "Show alternatives"}
              </button>

              {alternativesError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{alternativesError}</p>
              )}

              {showAlternatives && alternatives && alternatives.length > 0 && (
                <div className="mt-3 space-y-2">
                  {alternatives.map((alt, index) => (
                    <AlternativeCard key={index} alt={alt} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeneratedWorkoutExerciseRow;
