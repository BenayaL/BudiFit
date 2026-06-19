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
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-100" />
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
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Needs attention</h2>
          <p className="mt-1 text-sm text-slate-500">
            Plans and change requests waiting for your review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onViewPlans("coach-plans")}
          className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          View in Plans
        </button>
      </div>

      <div className="mt-5 space-y-5">

        {/* ── Plans waiting for review ───────────────────────────────────────── */}
        <div>
          <SectionLabel label="Plans waiting for review" />
          <div className="mt-3 space-y-2">
            {plans.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">
                No pending plans.
              </p>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{plan.title}</p>
                    <p className="text-xs text-slate-500">For {plan.traineeName}</p>
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

        {/* ── Trainee change requests ────────────────────────────────────────── */}
        <div>
          <SectionLabel label="Trainee change requests" />
          <div className="mt-3 space-y-2">
            {requests.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">
                No pending change requests.
              </p>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-purple-100 bg-purple-50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{r.traineeName}</p>
                    <span className="shrink-0 text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-purple-700">{r.planTitle}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{r.message}</p>
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
