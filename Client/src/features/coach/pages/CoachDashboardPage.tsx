import type { Page } from "../../../app/app.types";
import {
  fakeCoach,
  fakeCoachPlans,
  fakeTrainees,
} from "../../../Data/fakeData";
import TraineeCard from "../components/TraineeCard";

interface CoachDashboardPageProps {
  onChangePage: (page: Page) => void;
  onReviewPlan: (planId: string) => void;
  onViewTraineeProfile: (traineeId: string) => void;
}

function CoachDashboardPage({
  onChangePage,
  onReviewPlan,
  onViewTraineeProfile,
}: CoachDashboardPageProps) {
  const activeTrainees = fakeTrainees.filter(
    (trainee) => trainee.status === "active"
  ).length;

  const traineesNeedingAttention = fakeTrainees.filter(
    (trainee) => trainee.status === "needs_attention"
  ).length;

  const pendingPlans = fakeCoachPlans.filter(
    (plan) => plan.status === "pending_approval"
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-purple-900 p-8 text-white shadow-lg">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-200">
          Coach area
        </p>

        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
          Welcome back, Coach {fakeCoach.firstName}
        </h1>

        <p className="mt-3 max-w-2xl text-purple-100">
          Track your trainees, review their workout plans, and send feedback
          when someone needs help staying consistent.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Trainees" value={fakeTrainees.length.toString()} />
        <StatCard label="Active trainees" value={activeTrainees.toString()} />
        <StatCard
          label="Need attention"
          value={traineesNeedingAttention.toString()}
        />
        <StatCard label="Pending plans" value={pendingPlans.length.toString()} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                My trainees
              </h2>
              <p className="text-sm text-slate-500">
                Fake data for now. Later this will come from the backend.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onChangePage("coach-trainees")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              View all
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fakeTrainees.map((trainee) => (
              <TraineeCard key={trainee.userId} trainee={trainee} />
            ))}
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Plans waiting for review
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                The coach should approve, reject, or improve plans.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onChangePage("coach-plans")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              View all
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {pendingPlans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{plan.title}</h3>
                    <p className="text-sm text-slate-500">
                      For {plan.traineeName}
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                    Pending
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {plan.exercises.length} exercises in this plan.
                </p>

                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
                  onClick={() => onReviewPlan(plan.id)}
                >
                  Review plan
                </button>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export default CoachDashboardPage;