import type { DailyDayInfo } from "./dailyWorkout.models";

interface TomorrowWorkoutCardProps {
  tomorrow: DailyDayInfo;
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

export function TomorrowWorkoutCard({
  tomorrow,
  onViewDetails,
}: TomorrowWorkoutCardProps) {
  const { planDay } = tomorrow;
  const isRestDay = !planDay || planDay.restDay;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Tomorrow
        </p>
        <p className="mt-1 text-sm text-slate-400">{formatDate(tomorrow.date)}</p>
      </div>

      {isRestDay ? (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="text-3xl" role="img" aria-label="rest">
            😴
          </span>
          <h3 className="mt-2 text-lg font-extrabold text-slate-700">
            Rest Day
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Recovery scheduled for tomorrow.
          </p>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-extrabold text-slate-800">
            {planDay!.title}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
              {planDay!.exercises.length} exercise
              {planDay!.exercises.length !== 1 ? "s" : ""}
            </span>
            {planDay!.durationMinutes > 0 && (
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                ~{planDay!.durationMinutes} min
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500 line-clamp-2">
            {planDay!.exercises
              .slice(0, 4)
              .map((e) => e.name)
              .join(" · ")}
            {planDay!.exercises.length > 4 ? " · …" : ""}
          </p>

          <button
            type="button"
            onClick={onViewDetails}
            className="mt-4 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-100"
          >
            Preview
          </button>
        </>
      )}
    </div>
  );
}
