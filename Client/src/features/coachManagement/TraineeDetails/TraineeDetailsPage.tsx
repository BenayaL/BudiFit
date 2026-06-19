import { useState, useEffect } from "react";
import { useTraineeDetails } from "./useTraineeDetails";
import { TraineeSummary } from "./TraineeSummary";
import { WeeklyActivityChart } from "./WeeklyActivityChart";
import { TraineePersonalDetails } from "./TraineePersonalDetails";
import { TraineePlansList } from "./TraineePlansList";
import type { TraineeDetailsPageProps } from "./TraineeDetails.types";
import { coachService } from "../coachService";
import type { WorkoutPlanChangeRequest } from "../coach.models";
import { useAuth } from "../../../app/AuthContext";

function TraineeDetailsPage({
  selectedTraineeId,
  onChangePage,
  onReviewPlan,
}: TraineeDetailsPageProps) {
  const { token } = useAuth();
  const { trainee, plans, isLoading, error } = useTraineeDetails(selectedTraineeId);

  const [changeRequests, setChangeRequests] = useState<WorkoutPlanChangeRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !selectedTraineeId) return;

    let cancelled = false;
    setRequestsLoading(true);
    setRequestsError(null);

    coachService
      .getTraineeChangeRequests(selectedTraineeId, token)
      .then((data) => {
        if (!cancelled) setChangeRequests(data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setRequestsError(err instanceof Error ? err.message : "Failed to load change requests.");
      })
      .finally(() => {
        if (!cancelled) setRequestsLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, selectedTraineeId]);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading trainee…</div>;

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

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
          {trainee.firstName?.charAt(0) || "?"}{trainee.lastName?.charAt(0) || ""}
        </div>
      </section>

      <TraineeSummary trainee={trainee} />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <WeeklyActivityChart weeklyActivity={trainee.weeklyActivity} />
          <TraineePersonalDetails trainee={trainee} />
        </div>
        <div className="space-y-6">
          <TraineePlansList plans={plans} onReviewPlan={onReviewPlan} />

          {/* ── Pending change requests ── */}
          {(requestsLoading || requestsError !== null || changeRequests.length > 0) && (
            <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">Change requests</h2>
              <p className="mt-1 text-sm text-slate-500">
                Workout-plan changes requested by this trainee.
              </p>

              {requestsLoading && (
                <p className="mt-4 text-sm text-slate-400">Loading…</p>
              )}

              {requestsError && (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {requestsError}
                </p>
              )}

              {!requestsLoading && !requestsError && changeRequests.length === 0 && (
                <p className="mt-4 text-sm text-slate-400">No change requests from this trainee.</p>
              )}

              {!requestsLoading && !requestsError && changeRequests.length > 0 && (
                <div className="mt-4 space-y-4">
                  {changeRequests.map((req) => (
                    <article
                      key={req.id}
                      className="rounded-2xl border border-orange-100 bg-orange-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {req.planTitle}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {new Date(req.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                          {req.status}
                        </span>
                      </div>
                      <blockquote className="mt-3 rounded-xl border-l-4 border-orange-300 bg-white pl-3 pr-2 py-2 text-sm italic text-slate-700">
                        "{req.message}"
                      </blockquote>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900">Generate plan with AI</h2>
            <p className="mt-2 text-sm text-slate-500">
              Create plans for your trainees from the Coach Plans page, where you can select any
              connected trainee and configure AI generation options.
            </p>
            <button
              type="button"
              onClick={() => onChangePage("coach-plans")}
              className="mt-4 rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              Go to Coach Plans
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default TraineeDetailsPage;
