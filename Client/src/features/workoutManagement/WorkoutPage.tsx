import { useState } from "react";
import { DailyWorkoutSection } from "./DailyWorkout/DailyWorkoutSection";
import { GeneratedWorkoutPlanCard } from "./WorkoutList/GeneratedWorkoutPlanCard";
import { useGeneratedWorkoutPlans } from "./useGeneratedWorkoutPlans";
import { WorkoutShareModal } from "./WorkoutShareModal";
import type { ShareTarget } from "./WorkoutShareModal";

interface WorkoutPageProps {
  onGoToPlansHistory: () => void;
  onSelectPlan: (planId: string) => void;
}

function WorkoutPage({ onGoToPlansHistory, onSelectPlan }: WorkoutPageProps) {
  const {
    plans,
    isLoading: plansLoading,
    isGenerating,
    actionPlanId,
    error: plansError,
    generatePlan,
    loadPlans,
    completePlan,
    removePlan,
    replacePlan,
    requestChange,
  } = useGeneratedWorkoutPlans();

  const [shareOpen, setShareOpen] = useState(false);

  const shareablePlan = plans.find(
    (p) =>
      p.status === "active" &&
      p.canViewDetails &&
      p.approvalStatus !== "pending_review"
  );

  const shareTarget: ShareTarget | null = shareablePlan
    ? { type: "workout-plan", planId: shareablePlan.id, planTitle: shareablePlan.title }
    : null;

  const hasActivePlan = plans.some(
    (p) => p.status === "active" || p.approvalStatus === "pending_review"
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Page header */}
      <section className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
          Gym
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">
          Workouts
        </h1>
        <p className="mt-3 max-w-2xl text-slate-500 dark:text-[#9E97AF]">
          Track your daily workouts and manage your personalized plans.
        </p>
      </section>

      {/* ── Section 1: Daily Workouts ── */}
      {/* Heading is rendered inside DailyWorkoutSection alongside its action buttons */}
      <section className="mb-12">
        <DailyWorkoutSection />
      </section>

      {/* ── Section 2: My Plans ── */}
      <section>
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">My Plans</h2>

          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void generatePlan()}
              disabled={isGenerating || hasActivePlan}
              className="rounded-2xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate plan"}
            </button>

            <button
              type="button"
              onClick={onGoToPlansHistory}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#211D2B] dark:text-[#C9C4D6] dark:hover:bg-[#2A2436]"
            >
              Plans History
            </button>

            <button
              type="button"
              onClick={() => setShareOpen(true)}
              disabled={!shareTarget}
              title={!shareTarget ? "No shareable active plan" : undefined}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {plansError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
            <p className="font-semibold text-red-700 dark:text-red-400">{plansError}</p>
            <button
              type="button"
              onClick={() => void loadPlans()}
              className="mt-3 text-sm font-bold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="mb-6 rounded-3xl border border-purple-200 bg-purple-50 p-6 text-center dark:border-purple-800/50 dark:bg-purple-900/20">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
            <p className="mt-4 font-bold text-purple-800 dark:text-purple-300">
              Budi is building your personalized workout plan...
            </p>
            <p className="mt-1 text-sm text-purple-600 dark:text-purple-400">
              This may take a few seconds.
            </p>
          </div>
        )}

        {plansLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-100 text-3xl dark:bg-purple-900/30">
              🏋️
            </div>
            <h3 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">
              No workout plan yet
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-slate-500 dark:text-[#9E97AF]">
              Generate a personalized plan based on your fitness level, goals
              and preferred number of weekly workouts.
            </p>
            <button
              type="button"
              onClick={() => void generatePlan()}
              disabled={isGenerating}
              className="mt-6 rounded-2xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
            >
              {isGenerating ? "Building your plan..." : "Generate my workout plan"}
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <GeneratedWorkoutPlanCard
                key={plan.id}
                plan={plan}
                onSelect={onSelectPlan}
                onComplete={(id) => void completePlan(id)}
                onRemove={(id) => void removePlan(id)}
                onReplace={(id, reason) => void replacePlan(id, reason)}
                onRequestChange={(id, message) => requestChange(id, message)}
                isActionInProgress={actionPlanId === plan.id}
              />
            ))}
          </div>
        )}
      </section>

      {shareOpen && shareTarget && (
        <WorkoutShareModal
          title="Share Workout Plan"
          target={shareTarget}
          onClose={() => setShareOpen(false)}
        />
      )}
    </main>
  );
}

export default WorkoutPage;
