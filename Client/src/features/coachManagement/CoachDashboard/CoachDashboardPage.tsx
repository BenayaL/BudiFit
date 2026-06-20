import { useCoachDashboard } from "./useCoachDashboard";
import { CoachStatsCard } from "./CoachStatsCard";
import { NeedsAttentionCard } from "./NeedsAttentionCard";
import TraineeCard from "../TraineeList/TraineeCard";
import type { CoachDashboardPageProps } from "./CoachDashboard.types";

function CoachDashboardPage({
  onChangePage,
  onReviewPlan,
  onViewTraineeProfile,
}: CoachDashboardPageProps) {
  const { coach, trainees, pendingPlans, pendingChangeRequests, isLoading, error } = useCoachDashboard();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  const activeCount = trainees.filter((t) => t.status === "active").length;
  const attentionCount = trainees.filter((t) => t.status === "needs_attention").length;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-purple-900 p-8 text-white shadow-lg">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-200">Coach area</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
          Welcome back, Coach {coach?.firstName}
        </h1>
        <p className="mt-3 max-w-2xl text-purple-100">
          Track your trainees, review their workout plans, and send feedback when someone needs help.
        </p>
      </section>

      <CoachStatsCard
        totalTrainees={trainees.length}
        activeTrainees={activeCount}
        traineesNeedingAttention={attentionCount}
        pendingPlansCount={pendingPlans.length}
        pendingRequestsCount={pendingChangeRequests.length}
      />

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">My trainees</h2>
              <p className="text-sm text-slate-500 dark:text-[#9E97AF]">Click a trainee card to view their profile.</p>
            </div>
            <button
              type="button"
              onClick={() => onChangePage("coach-trainees")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#211D2B] dark:text-[#C9C4D6] dark:hover:bg-[#2A2436]"
            >
              View all
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {trainees.map((trainee) => (
              <TraineeCard
                key={trainee.userId}
                trainee={trainee}
                onViewProfile={onViewTraineeProfile}
              />
            ))}
          </div>
        </div>

        <NeedsAttentionCard
          plans={pendingPlans.slice(0, 3)}
          requests={pendingChangeRequests.slice(0, 3)}
          onReviewPlan={onReviewPlan}
          onViewPlans={onChangePage}
        />
      </section>
    </main>
  );
}

export default CoachDashboardPage;
