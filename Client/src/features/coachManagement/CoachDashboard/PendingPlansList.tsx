import type { CoachPlan } from "../coach.models";
import type { Page } from "../../../app/app.types";
import { PendingPlanCard } from "./PendingPlanCard";

interface PendingPlansListProps {
  plans: CoachPlan[];
  onReviewPlan: (planId: string) => void;
  onViewAllPlans: (page: Page) => void;
}

export function PendingPlansList({ plans, onReviewPlan, onViewAllPlans }: PendingPlansListProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Plans waiting for review</h2>
          <p className="mt-1 text-sm text-slate-500">
            Approve, reject, or improve plans before they go live.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onViewAllPlans("coach-plans")}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          View all
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {plans.length === 0 && (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No pending plans.</p>
        )}
        {plans.map((plan) => (
          <PendingPlanCard key={plan.id} plan={plan} onReviewPlan={onReviewPlan} />
        ))}
      </div>
    </aside>
  );
}

export default PendingPlansList;
