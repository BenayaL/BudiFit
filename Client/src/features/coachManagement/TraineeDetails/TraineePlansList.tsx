import type { CoachPlan } from "../coach.models";

interface TraineesPlanListProps {
  plans: CoachPlan[];
  onReviewPlan: (planId: string) => void;
}

function planBadgeClasses(plan: CoachPlan) {
  if (plan.approvalStatus === "pending_review")
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
  if (plan.approvalStatus === "approved")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
  return "bg-slate-100 text-slate-500 dark:bg-[#2A2436] dark:text-[#9E97AF]";
}

function planBadgeLabel(plan: CoachPlan) {
  if (plan.approvalStatus === "pending_review") return "Pending review";
  if (plan.approvalStatus === "approved") return "Approved";
  return plan.status;
}

export function TraineePlansList({ plans, onReviewPlan }: TraineesPlanListProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">Trainee plans</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-[#9E97AF]">Plans connected to this trainee.</p>

      <div className="mt-5 space-y-3">
        {plans.length === 0 && (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-[#2A2436] dark:text-[#9E97AF]">
            No plans found for this trainee yet.
          </p>
        )}
        {plans.map((plan) => {
          const totalEx = plan.days.reduce(
            (s, d) => s + (d.restDay ? 0 : d.exercises.length),
            0
          );
          return (
            <article key={plan.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#3B344A] dark:bg-[#2A2436]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-[#F8F7FB]">{plan.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-[#9E97AF]">{totalEx} exercises</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${planBadgeClasses(plan)}`}>
                  {planBadgeLabel(plan)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onReviewPlan(plan.id)}
                className="mt-4 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
              >
                {plan.approvalStatus === "pending_review" ? "Review plan" : "Edit plan"}
              </button>
            </article>
          );
        })}
      </div>
    </aside>
  );
}

export default TraineePlansList;
