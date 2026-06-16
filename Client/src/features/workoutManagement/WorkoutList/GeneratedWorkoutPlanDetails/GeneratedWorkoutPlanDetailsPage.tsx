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
import { useExercisePreferences } from "../../ExercisePreferences/useExercisePreferences";

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

// 1-2 → easy (green), 3 → medium (amber), 4 → hard (red), 5 → epic (blue)
const DIFFICULTY_ACCENT = {
  easy:   { color: "#10B981", bg: "#D1FAE5" },
  medium: { color: "#F59E0B", bg: "#FEF3C7" },
  hard:   { color: "#E11D48", bg: "#FEE2E2" },
  epic:   { color: "#1D4ED8", bg: "#DBEAFE" },
} as const;

function getDifficultyAccent(difficulty: number) {
  if (difficulty <= 2) return DIFFICULTY_ACCENT.easy;
  if (difficulty === 3) return DIFFICULTY_ACCENT.medium;
  if (difficulty === 4) return DIFFICULTY_ACCENT.hard;
  return DIFFICULTY_ACCENT.epic;
}

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
  const { getPreference, setPreference } = useExercisePreferences();

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
    const isPendingReview =
      error?.includes("awaiting coach review") || error?.includes("coach review");

    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
        >
          ← Back to plans
        </button>

        <section className={`mt-6 rounded-3xl border p-6 ${
          isPendingReview
            ? "border-orange-200 bg-orange-50"
            : "border-red-200 bg-red-50"
        }`}>
          <h2 className={`font-extrabold ${isPendingReview ? "text-orange-800" : "text-red-800"}`}>
            {isPendingReview ? "Plan awaiting coach review" : "Could not load workout plan"}
          </h2>

          <p className={`mt-2 text-sm ${isPendingReview ? "text-orange-700" : "text-red-700"}`}>
            {isPendingReview
              ? "Your coach is reviewing this plan. You'll get a notification when it's approved."
              : (error ?? "Workout plan not found")}
          </p>

          {!isPendingReview && (
            <button
              type="button"
              onClick={() => void loadPlan()}
              className="mt-4 text-sm font-bold text-red-700 underline"
            >
              Try again
            </button>
          )}
        </section>
      </main>
    );
  }

  const accent = getDifficultyAccent(plan.difficulty);

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
        <div
          className="h-3"
          style={{ backgroundColor: accent.color }}
        />

        <div className="p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{
                backgroundColor: accent.bg,
                color: accent.color,
              }}
            >
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
                    className="h-1.5 w-5 rounded-full"
                    style={{
                      backgroundColor:
                        index < plan.difficulty
                          ? accent.color
                          : "#E2E8F0",
                    }}
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
            {[
              { label: "Duration",     value: `${plan.durationWeeks} weeks` },
              { label: "Days per week", value: String(plan.workoutDaysPerWeek) },
              { label: "Schedule",     value: `${plan.days.length} days` },
              {
                label: "Equipment",
                value: plan.equipment.length > 0
                  ? plan.equipment.join(", ")
                  : "No equipment",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl p-4"
                style={{ backgroundColor: accent.bg }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: accent.color }}
                >
                  {label}
                </p>

                <p className="mt-2 text-lg font-extrabold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
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
                getPreference={getPreference}
                onSetPreference={setPreference}
              />
            ))}
        </div>
      </section>
    </main>
  );
}

export default GeneratedWorkoutPlanDetailsPage;