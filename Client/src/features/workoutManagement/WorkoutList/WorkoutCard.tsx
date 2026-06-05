import type { WorkoutCardProps } from "./WorkoutList.types";

const STATUS_CLASSES: Record<string, string> = {
  not_started: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function WorkoutCard({ workout, onSelect }: WorkoutCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">{workout.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{workout.description}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASSES[workout.status] ?? STATUS_CLASSES.not_started}`}>
          {STATUS_LABELS[workout.status] ?? workout.status}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
        <span>⏱ {workout.durationMinutes} min</span>
        <span>🏋️ {workout.exercises.length} exercises</span>
      </div>

      <button
        type="button"
        onClick={() => onSelect(workout.id)}
        className="mt-5 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
      >
        Start workout
      </button>
    </article>
  );
}

export default WorkoutCard;
