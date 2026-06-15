import type { DailyDayInfo, DailyActivePlan } from "./dailyWorkout.models";

interface TodayWorkoutCardProps {
  today: DailyDayInfo;
  activePlan: DailyActivePlan;
  isCompleting: boolean;
  onMarkDone: () => void;
  onViewDetails: () => void;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function TodayWorkoutCard({
  today,
  activePlan,
  isCompleting,
  onMarkDone,
  onViewDetails,
}: TodayWorkoutCardProps) {
  const { planDay, completion } = today;
  const isRestDay = !planDay || planDay.restDay;
  const isDone = !!completion;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-600">
            Today
          </p>
          <p className="mt-1 text-sm text-slate-500">{formatDate(today.date)}</p>
        </div>

        {isDone && (
          <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Completed
          </span>
        )}
      </div>

      {isRestDay ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="text-4xl" role="img" aria-label="rest">
            😴
          </span>
          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            Rest Day
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Recovery is part of training. See you tomorrow!
          </p>
        </div>
      ) : (
        <>
          <h3 className="text-xl font-extrabold text-slate-900">
            {planDay!.title}
          </h3>

          <div className="mt-2 flex flex-wrap gap-3">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              {planDay!.exercises.length} exercise
              {planDay!.exercises.length !== 1 ? "s" : ""}
            </span>
            {planDay!.durationMinutes > 0 && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                ~{planDay!.durationMinutes} min
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-slate-500 line-clamp-2">
            {planDay!.exercises
              .slice(0, 4)
              .map((e) => e.name)
              .join(" · ")}
            {planDay!.exercises.length > 4 ? " · …" : ""}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onViewDetails}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              View Workout
            </button>

            {!isDone && (
              <button
                type="button"
                onClick={onMarkDone}
                disabled={isCompleting}
                className="rounded-2xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCompleting ? "Saving…" : "Mark as Done"}
              </button>
            )}

          </div>
        </>
      )}

      <p className="mt-4 text-xs text-slate-400">{activePlan.title}</p>
    </div>
  );
}
