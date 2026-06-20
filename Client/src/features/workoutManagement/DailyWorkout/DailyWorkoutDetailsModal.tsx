import type { DailyPlanDay } from "./dailyWorkout.models";
import type { ExercisePreference, ExercisePreferenceReason, ExercisePreferenceValue } from "../ExercisePreferences/exercisePreference.models";
import { ExercisePreferenceButtons } from "../ExercisePreferences/ExercisePreferenceButtons";

interface DailyWorkoutDetailsModalProps {
  day: DailyPlanDay;
  dateLabel: string;
  label: "Today" | "Tomorrow";
  onClose: () => void;
  getPreference?: (exerciseName: string) => ExercisePreference | undefined;
  onSetPreference?: (
    exerciseName: string,
    preference: ExercisePreferenceValue | null,
    reason?: ExercisePreferenceReason
  ) => void;
}

function buildTarget(ex: {
  sets?: number;
  reps?: string;
  durationSec?: number;
}): string {
  if (ex.sets !== undefined && ex.reps) return `${ex.sets} × ${ex.reps}`;
  if (ex.reps) return ex.reps;
  if (ex.durationSec !== undefined) return `${ex.durationSec} sec`;
  if (ex.sets !== undefined) return `${ex.sets} sets`;
  return "";
}

export function DailyWorkoutDetailsModal({
  day,
  dateLabel,
  label,
  onClose,
  getPreference,
  onSetPreference,
}: DailyWorkoutDetailsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#211D2B] dark:border dark:border-[#3B344A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-[#3B344A]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              {label}
            </p>
            <h2 className="mt-0.5 text-xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">
              {day.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#9E97AF]">{dateLabel}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-[#9E97AF] dark:hover:bg-[#2A2436]"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Meta */}
        <div className="flex gap-3 px-6 pt-4">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
            {day.exercises.length} exercise{day.exercises.length !== 1 ? "s" : ""}
          </span>
          {day.durationMinutes > 0 && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-[#2A2436] dark:text-[#9E97AF]">
              ~{day.durationMinutes} min
            </span>
          )}
        </div>

        {/* Exercise list */}
        <div className="mt-4 max-h-[55vh] overflow-y-auto">
          {day.exercises.map((ex, idx) => {
            const target = buildTarget(ex);
            return (
              <div
                key={ex.id ?? idx}
                className="border-t border-slate-100 px-6 py-4 first:border-t-0 dark:border-[#3B344A]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-extrabold text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                    {String(ex.order).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-[#F8F7FB]">{ex.name}</h4>
                        {ex.equipment && ex.equipment !== "none" && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-[#9E97AF]">
                            {ex.equipment}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {target && (
                          <span className="text-base font-extrabold text-slate-900 dark:text-[#F8F7FB]">
                            {target}
                          </span>
                        )}
                        {onSetPreference && (
                          <ExercisePreferenceButtons
                            exerciseName={ex.name}
                            preference={getPreference?.(ex.name)?.preference}
                            onSetPreference={(preference, reason) =>
                              onSetPreference(ex.name, preference, reason)
                            }
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {ex.restSec !== undefined && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-[#2A2436] dark:text-[#9E97AF]">
                          Rest: {ex.restSec}s
                        </span>
                      )}
                    </div>

                    {ex.notes && (
                      <p className="mt-2 text-sm text-slate-500 dark:text-[#9E97AF]">{ex.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 dark:border-[#3B344A]">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-[#2A2436] dark:hover:bg-[#3B344A]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
