import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../../../app/AuthContext";

import type {
  GeneratedWorkoutPlan,
} from "../../workout.models";

import { workoutService } from "../../workoutService";

import { GeneratedWorkoutDayRow } from "./GeneratedWorkoutDayRow";

interface GeneratedWorkoutPlanDetailsPageProps {
  planId: string;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<
  GeneratedWorkoutPlan["category"],
  string
> = {
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  endurance: "Endurance",
  general_fitness: "General Fitness",
  mobility: "Mobility",
  weight_loss: "Weight Loss",
};

function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load workout plan";
}

export function GeneratedWorkoutPlanDetailsPage({
  planId,
  onBack,
}: GeneratedWorkoutPlanDetailsPageProps) {
  const { token } = useAuth();

  const [plan, setPlan] =
    useState<GeneratedWorkoutPlan | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    if (!token) {
      setError(
        "You must be logged in to view this workout plan."
      );
      setIsLoading(false);
      return;
    }

    if (!planId.trim()) {
      setError("Workout plan ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedPlan =
        await workoutService.getGeneratedWorkoutPlanById(
          planId,
          token
        );

      setPlan(loadedPlan);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [planId, token]);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading workout plan...
          </p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
        >
          ← Back to plans
        </button>

        <section className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-extrabold text-red-800">
            Could not load workout plan
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error ?? "Workout plan not found"}
          </p>

          <button
            type="button"
            onClick={() => void loadPlan()}
            className="mt-4 text-sm font-bold text-red-700 underline"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <button
        type="button"
        onClick={onBack}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        ← Plans
      </button>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="h-3 bg-purple-500" />

        <div className="p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
              {CATEGORY_LABELS[plan.category]}
            </span>

            <div
              className="flex gap-1"
              aria-label={`Difficulty ${plan.difficulty} out of 5`}
            >
              {Array.from({ length: 5 }).map(
                (_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-5 rounded-full ${
                      index < plan.difficulty
                        ? "bg-purple-500"
                        : "bg-slate-200"
                    }`}
                  />
                )
              )}
            </div>
          </div>

          <h1 className="mt-5 text-4xl font-extrabold text-slate-900">
            {plan.title}
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            {plan.description}
          </p>

          {plan.requiresProfessionalReview && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-amber-800">
                Professional review required
              </p>

              <p className="mt-1 text-sm text-amber-700">
                Review this workout plan with a
                qualified professional before starting.
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-purple-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-purple-500">
                Duration
              </p>

              <p className="mt-2 text-lg font-extrabold text-slate-900">
                {plan.durationWeeks} weeks
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-purple-500">
                Days per week
              </p>

              <p className="mt-2 text-lg font-extrabold text-slate-900">
                {plan.workoutDaysPerWeek}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-purple-500">
                Schedule
              </p>

              <p className="mt-2 text-lg font-extrabold text-slate-900">
                {plan.days.length} days
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-purple-500">
                Equipment
              </p>

              <p className="mt-2 text-sm font-extrabold text-slate-900">
                {plan.equipment.length > 0
                  ? plan.equipment.join(", ")
                  : "No equipment"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Weekly schedule
          </h2>

          <p className="text-sm text-slate-500">
            Tap a workout day to see exercises
          </p>
        </div>

        <div className="space-y-3">
          {[...plan.days]
            .sort(
              (firstDay, secondDay) =>
                firstDay.dayNumber -
                secondDay.dayNumber
            )
            .map((day) => (
              <GeneratedWorkoutDayRow
                key={
                  day.id ??
                  `day-${day.dayNumber}`
                }
                day={day}
              />
            ))}
        </div>
      </section>
    </main>
  );
}

export default GeneratedWorkoutPlanDetailsPage;