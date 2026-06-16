import { useState } from "react";

import type {
  GeneratedWorkoutDay,
} from "../../workout.models";
import type { ExercisePreference, ExercisePreferenceReason, ExercisePreferenceValue } from "../../ExercisePreferences/exercisePreference.models";

import { GeneratedWorkoutExerciseRow } from "./GeneratedWorkoutExerciseRow";

interface GeneratedWorkoutDayRowProps {
  day: GeneratedWorkoutDay;
  getPreference?: (exerciseName: string) => ExercisePreference | undefined;
  onSetPreference?: (
    exerciseName: string,
    preference: ExercisePreferenceValue | null,
    reason?: ExercisePreferenceReason
  ) => void;
}

export function GeneratedWorkoutDayRow({
  day,
  getPreference,
  onSetPreference,
}: GeneratedWorkoutDayRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (day.restDay) {
    return (
      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
        <div className="flex items-center gap-4 px-5 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-sm font-extrabold text-slate-600">
            {String(day.dayNumber).padStart(2, "0")}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                Rest
              </span>

              <h3 className="font-extrabold text-slate-800">
                {day.title}
              </h3>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Recovery day
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`overflow-hidden rounded-3xl border bg-white transition ${
        isOpen
          ? "border-purple-500 shadow-md"
          : "border-slate-200 shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={() =>
          setIsOpen((currentValue) => !currentValue)
        }
        className="flex w-full items-center gap-4 px-5 py-5 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-sm font-extrabold text-purple-700">
          {String(day.dayNumber).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-slate-900">
            {day.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {day.durationMinutes} min ·{" "}
            {day.exercises.length} exercises
          </p>
        </div>

        <span
          className={`text-xl text-slate-400 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        >
          ›
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-purple-100">
          {day.exercises.map((exercise) => (
            <GeneratedWorkoutExerciseRow
              key={
                exercise.id ??
                `${day.dayNumber}-${exercise.order}`
              }
              exercise={exercise}
              preference={getPreference?.(exercise.name)?.preference}
              onSetPreference={
                onSetPreference
                  ? (preference, reason) => onSetPreference(exercise.name, preference, reason)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </article>
  );
}

export default GeneratedWorkoutDayRow;