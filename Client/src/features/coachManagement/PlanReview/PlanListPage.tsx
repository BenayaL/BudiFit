import { usePlanList } from "./usePlanReview";
import { useCoachChangeRequests } from "./useCoachChangeRequests";
import { PlanCard } from "./PlanCard";
import { ChangeRequestCard } from "./ChangeRequestCard";
import type { PlanListPageProps } from "./PlanReview.types";

function PlanCounter({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}

function PlanListPage({ onChangePage, onReviewPlan, onReviewPlanFromRequest }: PlanListPageProps) {
  const { plans, isLoading, error } = usePlanList();
  const {
    requests,
    pendingCount,
    isLoading: requestsLoading,
    error: requestsError,
    rejectRequest,
  } = useCoachChangeRequests();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading plans…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const pendingPlanCount = plans.filter((p) => p.approvalStatus === "pending_review").length;
  const approvedCount = plans.filter((p) => p.approvalStatus === "approved").length;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Coach plans</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Workout plans</h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Review, edit, and approve AI-generated plans for your trainees.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChangePage("coach-dashboard")}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to dashboard
        </button>
      </section>

      {/* ── Summary counters ── */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <PlanCounter label="Pending review" value={pendingPlanCount} />
        <PlanCounter label="Approved" value={approvedCount} />
        <PlanCounter label="Total" value={plans.length} />
        <article className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <p className="text-sm font-bold text-orange-600">Pending requests</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{pendingCount}</p>
        </article>
      </section>

      {/* ── Change requests ── */}
      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-2xl font-extrabold text-slate-900">Change requests</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review requests submitted by your trainees.
          </p>
        </div>

        {requestsLoading && (
          <p className="text-sm text-slate-400">Loading change requests…</p>
        )}

        {requestsError && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {requestsError}
          </p>
        )}

        {!requestsLoading && !requestsError && requests.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">No pending change requests.</p>
          </div>
        )}

        {!requestsLoading && !requestsError && requests.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {requests.map((request) => (
              <ChangeRequestCard
                key={request.id}
                request={request}
                onEditPlan={onReviewPlanFromRequest}
                onRejectRequest={rejectRequest}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Workout plan list ── */}
      {plans.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">No plans yet. Plans appear here when trainees generate them.</p>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onReviewPlan={onReviewPlan} />
          ))}
        </section>
      )}
    </main>
  );
}

export default PlanListPage;
