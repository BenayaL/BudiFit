import type { CoachPlan, CoachChangeRequestDTO } from "../coach.models";
import type { Page } from "../../../app/app.types";

interface NeedsAttentionCardProps {
  plans: CoachPlan[];
  requests: CoachChangeRequestDTO[];
  onReviewPlan: (planId: string) => void;
  onViewPlans: (page: Page) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#9E97AF]">{label}</span>
      <div className="h-px flex-1 bg-slate-100 dark:bg-[#3B344A]" />
    </div>
  );
}

export function NeedsAttentionCard({
  plans,
  requests,
  onReviewPlan,
  onViewPlans,
}: NeedsAttentionCardProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">Needs attention</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#9E97AF]">
            Plans and change requests waiting for your review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onViewPlans("coach-plans")}
          className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
        >
          View in Plans
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <SectionLabel label="Plans waiting for review" />
          <div className="mt-3 space-y-2">
            {plans.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-[#2A2436] dark:text-[#9E97AF]">
                No pending plans.
              </p>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-[#3B344A] dark:bg-[#2A2436]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-[#F8F7FB]">{plan.title}</p>
                    <p className="text-xs text-slate-500 dark:text-[#9E97AF]">For {plan.traineeName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onReviewPlan(plan.id)}
                    className="shrink-0 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-purple-700"
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <SectionLabel label="Trainee change requests" />
          <div className="mt-3 space-y-2">
            {requests.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-[#2A2436] dark:text-[#9E97AF]">
                No pending change requests.
              </p>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-purple-100 bg-purple-50 p-3 dark:border-purple-900/40 dark:bg-purple-900/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-[#F8F7FB]">{r.traineeName}</p>
                    <span className="shrink-0 text-xs text-slate-400 dark:text-[#9E97AF]">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">{r.planTitle}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-[#C9C4D6]">{r.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default NeedsAttentionCard;
