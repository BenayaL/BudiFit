import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../app/AuthContext";
import { dailyWorkoutService } from "./dailyWorkoutService";
import type { DailyWorkoutDayDetails } from "./dailyWorkout.models";

interface MissedWorkoutModalProps {
  date: string; // "YYYY-MM-DD"
  onClose: () => void;
  onCompleted: () => void;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function MissedWorkoutModal({ date, onClose, onCompleted }: MissedWorkoutModalProps) {
  const { token } = useAuth();
  const [details, setDetails] = useState<DailyWorkoutDayDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await dailyWorkoutService.getDay(date, token);
      setDetails(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load workout details."
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, date]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleMarkCompleted() {
    if (!token || !details?.planId) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await dailyWorkoutService.completeWorkout(details.planId, date, token);
      setDetails((d) => (d ? { ...d, completion: { id: result.id, completedAt: result.completedAt } } : d));
      onCompleted();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to mark workout as completed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const planDay = details?.planDay ?? null;
  const isRestDay = !planDay || planDay.restDay;
  const isCompleted = !!details?.completion;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#211D2B] dark:border dark:border-[#3B344A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-[#3B344A]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
              {isCompleted ? "Completed" : "Missed workout"}
            </p>
            <h2 className="mt-0.5 text-xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">
              {planDay?.title ?? "Workout"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#9E97AF]">{formatDate(date)}</p>
          </div>

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

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
          </div>
        ) : loadError ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">{loadError}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 dark:bg-[#2A2436] dark:hover:bg-[#3B344A]"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {isCompleted && details?.completion && (
              <div className="mx-6 mt-4 flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 w-fit dark:bg-emerald-900/20 dark:text-emerald-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Completed{" "}
                {new Date(details.completion.completedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            )}

            {isRestDay ? (
              <div className="flex flex-col items-center px-6 py-8 text-center">
                <span className="text-4xl" role="img" aria-label="rest">😴</span>
                <p className="mt-3 text-sm text-slate-500 dark:text-[#9E97AF]">
                  This was a rest day — nothing to mark as completed.
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-3 px-6 pt-4">
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                    {planDay.exercises.length} exercise{planDay.exercises.length !== 1 ? "s" : ""}
                  </span>
                  {planDay.durationMinutes > 0 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-[#2A2436] dark:text-[#9E97AF]">
                      ~{planDay.durationMinutes} min
                    </span>
                  )}
                </div>

                <div className="mt-3 max-h-[40vh] overflow-y-auto px-6">
                  {planDay.exercises.map((ex, idx) => (
                    <div
                      key={ex.id ?? idx}
                      className="border-t border-slate-100 py-3 first:border-t-0 dark:border-[#3B344A]"
                    >
                      <p className="font-bold text-slate-900 dark:text-[#F8F7FB]">{ex.name}</p>
                      <p className="text-xs text-slate-500 dark:text-[#9E97AF]">
                        {ex.sets !== undefined && ex.reps
                          ? `${ex.sets} × ${ex.reps}`
                          : ex.reps ?? (ex.durationSec !== undefined ? `${ex.durationSec} sec` : "")}
                      </p>
                    </div>
                  ))}
                </div>

                {submitError && (
                  <p className="mx-6 mt-4 text-sm font-semibold text-red-600 dark:text-red-400">
                    {submitError}
                  </p>
                )}

                <div className="mt-4 border-t border-slate-100 px-6 py-4 dark:border-[#3B344A]">
                  {isCompleted ? (
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-[#2A2436] dark:hover:bg-[#3B344A]"
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleMarkCompleted()}
                      disabled={isSubmitting}
                      className="w-full rounded-2xl bg-green-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving…" : "I completed this workout"}
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
