import { usePlanList } from "./usePlanReview";
import { useCoachChangeRequests } from "./useCoachChangeRequests";
import { PlanCard } from "./PlanCard";
import { ChangeRequestCard } from "./ChangeRequestCard";
import { GeneratePlanForTraineePanel } from "./GeneratePlanForTraineePanel";
import type { PlanListPageProps } from "./PlanReview.types";

function PlanCounter({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
      <p className="text-sm font-bold text-slate-500 dark:text-[#9E97AF]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">{value}</p>
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

  if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-[#9E97AF]">Loading plans…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const pendingPlanCount = plans.filter((p) => p.approvalStatus === "pending_review").length;
  const approvedCount = plans.filter((p) => p.approvalStatus === "approved").length;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Coach plans</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">Workout plans</h1>
          <p className="mt-3 max-w-2xl text-slate-500 dark:text-[#9E97AF]">
            Review, edit, and approve AI-generated plans for your trainees.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChangePage("coach-dashboard")}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
        >
          Back to dashboard
        </button>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <PlanCounter label="Pending review" value={pendingPlanCount} />
        <PlanCounter label="Approved" value={approvedCount} />
        <PlanCounter label="Total" value={plans.length} />
        <article className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm dark:border-orange-800/40 dark:bg-orange-900/20">
          <p className="text-sm font-bold text-orange-600 dark:text-orange-400">Pending requests</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">{pendingCount}</p>
        </article>
      </section>

      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">Change requests</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#9E97AF]">
            Review requests submitted by your trainees.
          </p>
        </div>

        {requestsLoading && (
          <p className="text-sm text-slate-400 dark:text-[#9E97AF]">Loading change requests…</p>
        )}

        {requestsError && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {requestsError}
          </p>
        )}

        {!requestsLoading && !requestsError && requests.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
            <p className="text-sm text-slate-500 dark:text-[#9E97AF]">No pending change requests.</p>
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

      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">Generate plan with AI</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#9E97AF]">
            Select one of your connected trainees and create a personalized workout plan using
            Gemini. The plan will be saved as a pending draft for your review.
          </p>
        </div>
        <GeneratePlanForTraineePanel plans={plans} onReviewPlan={onReviewPlan} />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">Trainee plans</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#9E97AF]">
            Review and manage workout plans created for your trainees.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
            <p className="text-slate-500 dark:text-[#9E97AF]">No plans yet. Plans appear here when trainees generate them.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onReviewPlan={onReviewPlan} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default PlanListPage;
