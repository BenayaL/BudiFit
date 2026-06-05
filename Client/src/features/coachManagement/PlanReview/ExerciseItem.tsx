import type { PlanExercise } from "../coach.models";

interface ExerciseItemProps {
  exercise: PlanExercise;
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export function ExerciseItem({ exercise }: ExerciseItemProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">{exercise.name}</h3>
          <p className="mt-1 text-sm text-slate-500">Equipment: {exercise.equipment}</p>
        </div>
        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
          {exercise.difficulty}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoBox label="Sets" value={exercise.sets.toString()} />
        <InfoBox label="Reps" value={exercise.reps?.toString() ?? "N/A"} />
      </div>
    </article>
  );
}

export default ExerciseItem;
