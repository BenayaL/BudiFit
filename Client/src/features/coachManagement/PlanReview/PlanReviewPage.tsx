import { usePlanReview } from "./usePlanReview";
import { ExerciseList } from "./ExerciseList";
import { PlanReviewActions } from "./PlanReviewActions";
import type { PlanReviewPageProps } from "./PlanReview.types";

function PlanReviewPage({ selectedPlanId, onChangePage }: PlanReviewPageProps) {
  const { plan, isLoading } = usePlanReview(selectedPlanId);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading plan…</div>;

  if (!plan) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">No plan selected</h1>
          <p className="mt-3 text-slate-500">Please choose a plan from the plans page.</p>
          <button
            type="button"
            onClick={() => onChangePage("coach-plans")}
            className="mt-6 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
          >
            Go to plans
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Plan review</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">{plan.title}</h1>
          <p className="mt-3 text-slate-500">
            Reviewing plan for{" "}
            <span className="font-bold text-slate-700">{plan.traineeName}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChangePage("coach-plans")}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to plans
        </button>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <ExerciseList exercises={plan.exercises} />
        <PlanReviewActions
          onApprove={() => alert("Plan approved")}
          onRequestChanges={() => alert("Changes requested")}
          onReject={() => alert("Plan rejected")}
        />
      </section>
    </main>
  );
}

export default PlanReviewPage;
