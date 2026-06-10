import type { GeneratedWorkoutExercise } from "../../workout.models";

interface GeneratedWorkoutExerciseRowProps {
  exercise: GeneratedWorkoutExercise;
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

export function GeneratedWorkoutExerciseRow({
  exercise,
}: GeneratedWorkoutExerciseRowProps) {
  const exerciseTarget =
    buildExerciseTarget(exercise);

  return (
    <div className="border-t border-slate-200 px-5 py-4 first:border-t-0">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-extrabold text-purple-700">
          {String(exercise.order).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="font-bold text-slate-900">
                {exercise.name}
              </h4>

              {exercise.equipment &&
                exercise.equipment !== "none" && (
                  <p className="mt-1 text-xs text-slate-500">
                    Equipment: {exercise.equipment}
                  </p>
                )}
            </div>

            {exerciseTarget && (
              <div className="shrink-0 text-base font-extrabold text-slate-900">
                {exerciseTarget}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {exercise.restSec !== undefined && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Rest: {exercise.restSec} sec
              </span>
            )}

            {exercise.durationSec !== undefined &&
              exercise.sets !== undefined && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Duration: {exercise.durationSec} sec
                </span>
              )}
          </div>

          {exercise.notes && (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {exercise.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GeneratedWorkoutExerciseRow;