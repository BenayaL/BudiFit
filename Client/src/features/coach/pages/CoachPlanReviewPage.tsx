import type { Page } from "../../../app/app.types";
import { fakeCoachPlans } from "../../../Data/fakeData";

interface CoachPlanReviewPageProps {
  selectedPlanId: string | null;
  onChangePage: (page: Page) => void;
}

export default function CoachPlanReviewPage({
  selectedPlanId,
  onChangePage,
}: CoachPlanReviewPageProps) {
  const plan = fakeCoachPlans.find((item) => item.id === selectedPlanId);

  if (!plan) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">
            No plan selected
          </h1>

          <p className="mt-3 text-slate-500">
            Please choose a plan from the plans page.
          </p>

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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
            Plan review
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            {plan.title}
          </h1>

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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Exercises
          </h2>

          <div className="mt-5 space-y-4">
            {plan.exercises.map((exercise) => (
              <article
                key={exercise.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {exercise.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Equipment: {exercise.equipment}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                    {exercise.difficulty}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <InfoBox label="Sets" value={exercise.sets.toString()} />
                  <InfoBox label="Reps" value={exercise.reps?.toString() ?? "N/A"} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Coach decision
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            For now these buttons only show an alert. Later they should update
            the plan status in the backend.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => alert("Plan approved")}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Approve plan
            </button>

            <button
              type="button"
              onClick={() => alert("Changes requested")}
              className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Request changes
            </button>

            <button
              type="button"
              onClick={() => alert("Plan rejected")}
              className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Reject plan
            </button>
          </div>

          <label className="mt-6 block">
            <span className="text-sm font-bold text-slate-700">
              Coach notes
            </span>

            <textarea
              rows={5}
              placeholder="Write feedback for the trainee..."
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
            />
          </label>
        </aside>
      </section>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}