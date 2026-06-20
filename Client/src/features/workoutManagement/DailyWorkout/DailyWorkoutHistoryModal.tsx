import { useState, useEffect } from "react";
import { useAuth } from "../../../app/AuthContext";
import { dailyWorkoutService } from "./dailyWorkoutService";
import type { WorkoutHistoryEntry } from "./dailyWorkout.models";

interface DailyWorkoutHistoryModalProps {
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function DailyWorkoutHistoryModal({
  onClose,
}: DailyWorkoutHistoryModalProps) {
  const { token } = useAuth();
  const [entries, setEntries] = useState<WorkoutHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    dailyWorkoutService
      .getHistory(token)
      .then(setEntries)
      .catch(() => setError("Failed to load workout history."))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#211D2B] dark:border dark:border-[#3B344A]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-[#3B344A]">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">
            Workout History
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-[#9E97AF] dark:hover:bg-[#2A2436]"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-sm text-red-600">
              {error}
            </div>
          ) : entries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-500 dark:text-[#9E97AF]">No workout history yet.</p>
              <p className="mt-1 text-sm text-slate-400 dark:text-[#9E97AF]">
                Mark today's workout as done to start tracking.
              </p>
            </div>
          ) : (
            <div>
              {entries.map((entry) => (
                <div
                  key={`${entry.planId}:${entry.date}`}
                  className="flex items-center gap-4 border-b border-slate-100 px-6 py-4 last:border-b-0 dark:border-[#3B344A]"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      entry.status === "completed"
                        ? "bg-green-100 text-green-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {entry.status === "completed" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-[#F8F7FB]">
                      {entry.dayTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-[#9E97AF]">
                      {formatDate(entry.date)} · {entry.planTitle}
                      {entry.durationMinutes > 0 &&
                        ` · ${entry.durationMinutes} min`}
                    </p>
                    {entry.exerciseSummary && (
                      <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-[#9E97AF]">
                        {entry.exerciseSummary}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      entry.status === "completed"
                        ? "bg-green-100 text-green-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {entry.status === "completed" ? "Done" : "Missed"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 dark:border-[#3B344A]">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-[#2A2436] dark:hover:bg-[#3B344A]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
