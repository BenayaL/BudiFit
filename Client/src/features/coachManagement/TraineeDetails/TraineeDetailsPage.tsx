import { useTraineeDetails } from "./useTraineeDetails";
import { TraineeSummary } from "./TraineeSummary";
import { WeeklyActivityChart } from "./WeeklyActivityChart";
import { TraineeGoals } from "./TraineeGoals";
import { TraineePlansList } from "./TraineePlansList";
import type { TraineeDetailsPageProps } from "./TraineeDetails.types";

function TraineeDetailsPage({
  selectedTraineeId,
  onChangePage,
  onReviewPlan,
}: TraineeDetailsPageProps) {
  const { trainee, plans, isLoading } = useTraineeDetails(selectedTraineeId);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading trainee…</div>;

  if (!trainee) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">No trainee selected</h1>
          <p className="mt-3 text-slate-500">Please choose a trainee from the trainees page.</p>
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
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Trainee profile</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            {trainee.firstName} {trainee.lastName}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Monitor progress, identify consistency issues, and review workout plans.
          </p>
        </div>
        <div
          className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] text-2xl font-extrabold text-white shadow-sm"
          style={{ backgroundColor: trainee.color }}
        >
          {trainee.firstName.charAt(0)}{trainee.lastName.charAt(0)}
        </div>
      </section>

      <TraineeSummary trainee={trainee} />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <WeeklyActivityChart weeklyActivity={trainee.weeklyActivity} />
          <TraineeGoals goals={trainee.goals} />
        </div>
        <TraineePlansList plans={plans} onReviewPlan={onReviewPlan} />
      </section>
    </main>
  );
}

export default TraineeDetailsPage;
