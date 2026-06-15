import type { CoachPlan } from "../coach.models";

interface PendingPlanCardProps {
  plan: CoachPlan;
  onReviewPlan: (planId: string) => void;
}

export function PendingPlanCard({ plan, onReviewPlan }: PendingPlanCardProps) {
  const totalExercises = plan.days.reduce(
    (s, d) => s + (d.restDay ? 0 : d.exercises.length),
    0
  );

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">{plan.title}</h3>
          <p className="text-sm text-slate-500">For {plan.traineeName}</p>
        </div>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
          Pending
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-600">{totalExercises} exercises in this plan.</p>

      <button
        type="button"
        onClick={() => onReviewPlan(plan.id)}
        className="mt-4 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
      >
        Review plan
      </button>
    </article>
  );
}

export default PendingPlanCard;
