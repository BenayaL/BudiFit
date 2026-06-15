import { useState } from "react";
import { GeneratedWorkoutPlanCard } from "./GeneratedWorkoutPlanCard";
import { useGeneratedWorkoutPlans } from "../useGeneratedWorkoutPlans";
import { ShareModal } from "../ShareModal";

interface WorkoutListPageProps {
  onGoToHistory: () => void;
  onSelectPlan: (planId: string) => void;
}

function WorkoutListPage({
  onGoToHistory,
  onSelectPlan,
}: WorkoutListPageProps) {
  const {
    plans,
    isLoading,
    isGenerating,
    actionPlanId,
    error,
    generatePlan,
    loadPlans,
    completePlan,
    removePlan,
    replacePlan,
    requestChange,
  } = useGeneratedWorkoutPlans();

  const [shareOpen, setShareOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />

          <p className="text-sm font-medium text-slate-500">
            Loading workout plans...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
            Gym
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
            Your workouts
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Personalized workout plans created
            from your fitness level, goals and
            weekly preferences.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void generatePlan()}
            disabled={
              isGenerating ||
              plans.some(
                (plan) =>
                  plan.status === "active" ||
                  plan.approvalStatus === "pending_review"
              )
            }
            className="rounded-2xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating
              ? "Generating..."
              : "Generate plan"}
          </button>

          <button
            type="button"
            onClick={onGoToHistory}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            View history
          </button>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
        </div>
      </section>

      {error && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadPlans()}
            className="mt-3 text-sm font-bold text-red-700 underline"
          >
            Try again
          </button>
        </section>
      )}

      {isGenerating && (
        <section className="mb-6 rounded-3xl border border-purple-200 bg-purple-50 p-6 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />

          <p className="mt-4 font-bold text-purple-800">
            Budi is building your personalized
            workout plan...
          </p>

          <p className="mt-1 text-sm text-purple-600">
            This may take a few seconds.
          </p>
        </section>
      )}

      {plans.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-100 text-3xl">
            🏋️
          </div>

          <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
            No workout plan yet
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-slate-500">
            Generate a personalized plan based on
            your fitness level, goals and preferred
            number of weekly workouts.
          </p>

          <button
            type="button"
            onClick={() => void generatePlan()}
            disabled={isGenerating}
            className="mt-6 rounded-2xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {isGenerating
              ? "Building your plan..."
              : "Generate my workout plan"}
          </button>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
        </section>
      )}

      {shareOpen && (
        <ShareModal
          title="Share — Workout Plan"
          onClose={() => setShareOpen(false)}
        />
      )}
    </main>
  );
}

export default WorkoutListPage;