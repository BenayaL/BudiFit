import { useState } from "react";
import type { GeneratedWorkoutPlanSummary } from "../workout.models";

interface HistoryPlanCardProps {
  plan: GeneratedWorkoutPlanSummary;
  onSelect: (planId: string) => void;
  onPermanentlyDelete: (planId: string) => void;
  isActionInProgress?: boolean;
}

const BADGE_STYLES: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  Removed: "bg-slate-200 text-slate-700 dark:bg-[#2A2436] dark:text-[#9E97AF]",
  Replaced: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  "Removed by coach": "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  "Replaced by new plan": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  Archived: "bg-slate-200 text-slate-700 dark:bg-[#2A2436] dark:text-[#9E97AF]",
};

function formatDate(value?: string): string {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function HistoryPlanCard({
  plan,
  onSelect,
  onPermanentlyDelete,
  isActionInProgress,
}: HistoryPlanCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const label = plan.historyLabel ?? "Archived";
  const badgeClass = BADGE_STYLES[label] ?? "bg-slate-200 text-slate-700 dark:bg-[#2A2436] dark:text-[#9E97AF]";

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}>
            {label}
          </span>
          <span className="text-xs font-medium text-slate-400 dark:text-[#9E97AF]">
            Ended {formatDate(plan.historyEndedAt)}
          </span>
        </div>

        <h2 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-[#F8F7FB]">{plan.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-[#9E97AF]">{plan.description}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-emerald-50 p-2 dark:bg-emerald-900/20">
            <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">{plan.completedWorkouts ?? 0}</p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-500">Completed</p>
          </div>
          <div className="rounded-2xl bg-red-50 p-2 dark:bg-red-900/20">
            <p className="text-lg font-extrabold text-red-600 dark:text-red-400">{plan.missedWorkouts ?? 0}</p>
            <p className="text-[11px] font-semibold text-red-500 dark:text-red-400">Missed</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2 dark:bg-[#2A2436]">
            <p className="text-lg font-extrabold text-slate-700 dark:text-[#C9C4D6]">{plan.completionRate ?? 0}%</p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-[#9E97AF]">Rate</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-[#3B344A] dark:text-[#C9C4D6]">
            {plan.durationWeeks} weeks
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-[#3B344A] dark:text-[#C9C4D6]">
            {plan.workoutDaysPerWeek} days/week
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onSelect(plan.id)}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
          >
            View details
          </button>

          {plan.canPermanentlyDelete && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isActionInProgress}
              className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              {isActionInProgress ? "..." : "Delete permanently"}
            </button>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-[#211D2B] dark:border dark:border-[#3B344A]">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-[#F8F7FB]">Delete this plan permanently?</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-[#9E97AF]">
              This will permanently remove "{plan.title}" and its daily completion and missed-workout
              history. This cannot be undone.
            </p>
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
              Your exercise likes and dislikes will remain saved.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  onPermanentlyDelete(plan.id);
                }}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default HistoryPlanCard;
