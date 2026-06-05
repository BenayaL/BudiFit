import type { CoachPlan } from "../coach.models";
import { PlanStatusBadge } from "./PlanStatusBadge";

interface PlanCardProps {
  plan: CoachPlan;
  onReviewPlan: (planId: string) => void;
}

export function PlanCard({ plan, onReviewPlan }: PlanCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{plan.title}</h2>
          <p className="mt-1 text-sm text-slate-500">Trainee: {plan.traineeName}</p>
        </div>
        <PlanStatusBadge status={plan.status} />
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-700">Exercises in plan</p>
        <ul className="mt-3 space-y-2">
          {plan.exercises.map((exercise) => (
            <li
              key={exercise.id}
              className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
            >
              <span className="font-semibold text-slate-700">{exercise.name}</span>
              <span className="text-slate-500">{exercise.sets} x {exercise.reps}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => onReviewPlan(plan.id)}
        className="mt-5 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
      >
        Review plan
      </button>
    </article>
  );
}

export default PlanCard;
