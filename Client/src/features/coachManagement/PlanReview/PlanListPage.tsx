import { usePlanList } from "./usePlanReview";
import { PlanCard } from "./PlanCard";
import type { PlanListPageProps } from "./PlanReview.types";

function PlanCounter({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}

function PlanListPage({ onChangePage, onReviewPlan }: PlanListPageProps) {
  const { plans, isLoading, error } = usePlanList();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading plans…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const pendingCount = plans.filter((p) => p.status === "pending_approval").length;
  const approvedCount = plans.filter((p) => p.status === "approved").length;
  const rejectedCount = plans.filter((p) => p.status === "rejected").length;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Coach plans</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Workout plans review</h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Review AI-generated or trainee-submitted plans before they become active.
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

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <PlanCounter label="Pending" value={pendingCount} />
        <PlanCounter label="Approved" value={approvedCount} />
        <PlanCounter label="Rejected" value={rejectedCount} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onReviewPlan={onReviewPlan} />
        ))}
      </section>
    </main>
  );
}

export default PlanListPage;
