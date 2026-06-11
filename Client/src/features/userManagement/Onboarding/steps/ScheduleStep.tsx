import type { PreferredWorkoutTime, SessionDurationMinutes } from "../../user.models";
import {
  PREFERRED_TIME_OPTIONS,
  SESSION_DURATION_OPTIONS,
  WEEKLY_WORKOUT_OPTIONS,
} from "../onboarding.constants";

interface ScheduleStepProps {
  weeklyWorkouts: number;
  preferredWorkoutTime: PreferredWorkoutTime | "";
  sessionDurationMinutes: SessionDurationMinutes;
  onWeeklyWorkoutsChange: (value: number) => void;
  onPreferredTimeChange: (value: PreferredWorkoutTime) => void;
  onSessionDurationChange: (value: SessionDurationMinutes) => void;
  validationError: string | null;
}

export function ScheduleStep({
  weeklyWorkouts,
  preferredWorkoutTime,
  sessionDurationMinutes,
  onWeeklyWorkoutsChange,
  onPreferredTimeChange,
  onSessionDurationChange,
  validationError,
}: ScheduleStepProps) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Step 8 · Training schedule
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
        When and how do you train?
      </h2>
      <p className="mt-2 mb-8 text-slate-500">
        Budi schedules your challenges around your routine.
      </p>

      <div className="space-y-8">
        {/* Days per week */}
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-700">
            Days per week{" "}
            <span className="ml-1 text-xl font-extrabold tabular-nums text-purple-600">
              {weeklyWorkouts}
            </span>
          </legend>
          <div className="flex gap-2">
            {WEEKLY_WORKOUT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onWeeklyWorkoutsChange(n)}
                aria-pressed={weeklyWorkouts === n}
                className={[
                  "h-12 w-12 rounded-xl border text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40",
                  weeklyWorkouts === n
                    ? "border-purple-600 bg-purple-600 text-white shadow-[0_6px_18px_rgba(124,58,237,0.35)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-purple-300",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Preferred workout time */}
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-700">
            Preferred session time <span className="text-purple-600">*</span>
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {PREFERRED_TIME_OPTIONS.map(({ value, label, timeRange, emoji }) => {
              const selected = preferredWorkoutTime === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onPreferredTimeChange(value)}
                  aria-pressed={selected}
                  className={[
                    "flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40",
                    selected
                      ? "border-purple-600 bg-purple-50 ring-2 ring-purple-500/30"
                      : "border-slate-200 bg-white hover:border-purple-300",
                  ].join(" ")}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="font-bold text-slate-900">{label}</span>
                  <span className="text-xs text-slate-400">{timeRange}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Session duration */}
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-700">
            Session length
          </legend>
          <div className="flex flex-wrap gap-2">
            {SESSION_DURATION_OPTIONS.map(({ value, label }) => {
              const selected = sessionDurationMinutes === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSessionDurationChange(value)}
                  aria-pressed={selected}
                  className={[
                    "rounded-2xl border px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40",
                    selected
                      ? "border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-500/30"
                      : "border-slate-200 bg-white text-slate-700 hover:border-purple-300",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {validationError && (
        <p className="mt-4 text-xs font-medium text-red-500" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}
