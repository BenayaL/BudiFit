import type { CoachPlan } from "../coach.models";

interface TraineesPlanListProps {
  plans: CoachPlan[];
  onReviewPlan: (planId: string) => void;
}

export function TraineePlansList({ plans, onReviewPlan }: TraineesPlanListProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-extrabold text-slate-900">Trainee plans</h2>
      <p className="mt-2 text-sm text-slate-500">Plans connected to this trainee.</p>

      <div className="mt-5 space-y-3">
        {plans.length === 0 && (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            No plans found for this trainee yet.
          </p>
        )}
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">{plan.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.exercises.length} exercises</p>
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                {plan.status}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onReviewPlan(plan.id)}
              className="mt-4 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              Review plan
            </button>
          </article>
        ))}
      </div>
    </aside>
  );
}

export default TraineePlansList;
