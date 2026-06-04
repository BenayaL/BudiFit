import type { Page } from "../../../app/app.types";
import { fakeCoachPlans, fakeTrainees } from "../../../Data/fakeData";

interface CoachTraineeProfilePageProps {
  selectedTraineeId: string | null;
  onChangePage: (page: Page) => void;
  onReviewPlan: (planId: string) => void;
}

export default function CoachTraineeProfilePage({
  selectedTraineeId,
  onChangePage,
  onReviewPlan,
}: CoachTraineeProfilePageProps) {
  const trainee = fakeTrainees.find(
    (item) => item.userId === selectedTraineeId
  );

  if (!trainee) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">
            No trainee selected
          </h1>

          <p className="mt-3 text-slate-500">
            Please choose a trainee from the trainees page.
          </p>

          <button
            type="button"
            onClick={() => onChangePage("coach-trainees")}
            className="mt-6 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
          >
            Go to trainees
          </button>
        </div>
      </main>
    );
  }

  const traineePlans = fakeCoachPlans.filter(
    (plan) => plan.traineeId === trainee.userId
  );

  const totalWeeklyActivity = trainee.weeklyActivity.reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <button
            type="button"
            onClick={() => onChangePage("coach-trainees")}
            className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ← Back to trainees
          </button>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
            Trainee profile
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            {trainee.firstName} {trainee.lastName}
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Monitor progress, identify consistency issues, and review workout
            plans for this trainee.
          </p>
        </div>

        <div
          className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] text-2xl font-extrabold text-white shadow-sm"
          style={{ backgroundColor: trainee.color }}
        >
          {trainee.firstName.charAt(0)}
          {trainee.lastName.charAt(0)}
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <ProfileStat label="Level" value={trainee.level} />
        <ProfileStat label="Streak" value={`${trainee.streakDays} days`} />
        <ProfileStat
          label="Completed"
          value={trainee.completedChallenges.toString()}
        />
        <ProfileStat label="Missed" value={trainee.missedWorkouts.toString()} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Weekly activity
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Total activities this week:{" "}
              <span className="font-bold text-slate-700">
                {totalWeeklyActivity}
              </span>
            </p>

            <div className="mt-6 grid grid-cols-7 gap-2">
              {trainee.weeklyActivity.map((value, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`mx-auto flex h-20 items-end justify-center rounded-2xl px-2 ${
                      value > 0 ? "bg-purple-100" : "bg-slate-100"
                    }`}
                  >
                    <div
                      className={`w-full rounded-xl ${
                        value > 0 ? "bg-purple-500" : "bg-slate-300"
                      }`}
                      style={{ height: `${Math.max(value * 25, 10)}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs font-bold text-slate-500">
                    Day {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Goals
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {trainee.goals.map((goal) => (
                <span
                  key={goal}
                  className="rounded-full bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700"
                >
                  {goal}
                </span>
              ))}
            </div>
          </article>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Trainee plans
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Plans connected to this trainee.
          </p>

          <div className="mt-5 space-y-3">
            {traineePlans.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No plans found for this trainee yet.
              </p>
            )}

            {traineePlans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{plan.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {plan.exercises.length} exercises
                    </p>
                  </div>

                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                    {plan.status}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onReviewPlan(plan.id)}
                  className="mt-4 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
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

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}