import type { Page } from "../../../app/app.types";
import { fakeCoachPlans } from "../../../Data/fakeData";

interface CoachPlansPageProps {
  onReviewPlan: (planId: string) => void;
  onChangePage: (page: Page) => void;
}

export default function CoachPlansPage({
  onReviewPlan,
  onChangePage,
}: CoachPlansPageProps) {
  const pendingPlans = fakeCoachPlans.filter((plan) => plan.status === "pending_approval");
  const approvedPlans = fakeCoachPlans.filter((plan) => plan.status === "approved");
  const rejectedPlans = fakeCoachPlans.filter((plan) => plan.status === "rejected");

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
            Coach plans
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            Workout plans review
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Review AI-generated or trainee-submitted plans before they become
            active for the trainee.
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
        <PlanCounter label="Pending" value={pendingPlans.length} />
        <PlanCounter label="Approved" value={approvedPlans.length} />
        <PlanCounter label="Rejected" value={rejectedPlans.length} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {fakeCoachPlans.map((plan) => (
          <article
            key={plan.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {plan.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Trainee: {plan.traineeName}
                </p>
              </div>

              <PlanStatusBadge status={plan.status} />
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-700">
                Exercises in plan
              </p>

              <ul className="mt-3 space-y-2">
                {plan.exercises.map((exercise) => (
                  <li
                    key={exercise.id}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-slate-700">
                      {exercise.name}
                    </span>

                    <span className="text-slate-500">
                      {exercise.sets} x {exercise.reps}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onReviewPlan(plan.id)}
              className="mt-5 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              Review plan
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

function PlanCounter({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}

function PlanStatusBadge({
  status,
}: {
  status: "pending_approval" | "approved" | "rejected";
}) {
  const classes =
    status === "pending_approval"
      ? "bg-orange-100 text-orange-700"
      : status === "approved"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${classes}`}>
      {status}
    </span>
  );
}