import { useState, useEffect, useCallback } from "react";
import { workoutService } from "../workoutService";
import { dailyWorkoutService } from "../DailyWorkout/dailyWorkoutService";
import type { GeneratedWorkoutPlanSummary } from "../workout.models";
import type { WorkoutHistoryEntry } from "../DailyWorkout/dailyWorkout.models";
import { HistoryPlanCard } from "./HistoryPlanCard";
import { useAuth } from "../../../app/AuthContext";
import { ShareModal } from "../ShareModal";
import type { ShareTarget } from "../ShareModal";

function getLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDailyDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface WorkoutHistoryPageProps {
  onBack: () => void;
  onSelectPlan: (planId: string) => void;
}

function WorkoutHistoryPage({ onBack, onSelectPlan }: WorkoutHistoryPageProps) {
  const { token } = useAuth();

  const [planHistory, setPlanHistory] = useState<GeneratedWorkoutPlanSummary[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const [dailyEntries, setDailyEntries] = useState<WorkoutHistoryEntry[]>([]);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyError, setDailyError] = useState("");

  const [shareOpen, setShareOpen] = useState(false);

  const loadPlanHistory = useCallback(async () => {
    if (!token) return;
    setPlansLoading(true);
    try {
      const data = await workoutService.getPlanHistory(getLocalDateString(), token);
      setPlanHistory(data);
    } catch (err) {
      console.error("[WORKOUT] Failed to load plan history:", err);
      setPlansError("Failed to load plan history.");
    } finally {
      setPlansLoading(false);
    }
  }, [token]);

  const loadDailyHistory = useCallback(async () => {
    if (!token) return;
    setDailyLoading(true);
    try {
      const data = await dailyWorkoutService.getHistory(token);
      setDailyEntries(data);
    } catch (err) {
      console.error("[WORKOUT] Failed to load daily workout history:", err);
      setDailyError("Failed to load daily workout history.");
    } finally {
      setDailyLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setPlansLoading(false);
      setDailyLoading(false);
      return;
    }
    void loadPlanHistory();
    void loadDailyHistory();
  }, [token, loadPlanHistory, loadDailyHistory]);

  const handlePermanentlyDelete = async (planId: string) => {
    if (!token) return;
    setDeletingPlanId(planId);
    try {
      await workoutService.permanentlyDeletePlan(planId, token);
      await Promise.all([loadPlanHistory(), loadDailyHistory()]);
    } catch (err) {
      console.error("[WORKOUT] Failed to permanently delete plan:", err);
      setPlansError("Failed to permanently delete plan.");
    } finally {
      setDeletingPlanId(null);
    }
  };

  const totalMinutes = dailyEntries
    .filter((e) => e.status === "completed")
    .reduce((sum, e) => sum + e.durationMinutes, 0);
  const completedCount = dailyEntries.filter((e) => e.status === "completed").length;
  const avgMinutes = completedCount > 0 ? Math.round(totalMinutes / completedCount) : 0;

  const loadingDone = !plansLoading && !dailyLoading;
  const hasHistory = planHistory.length > 0 || dailyEntries.length > 0;
  const shareDisabled = !loadingDone || !hasHistory;
  const historyTarget: ShareTarget = { type: "workout-history" };

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* ── Header ── */}
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-purple-600"
          >
            ← Back to workouts
          </button>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">History</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Workout history</h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Your plan history and daily workout completions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          disabled={shareDisabled}
          title={shareDisabled ? "No history to share" : undefined}
          className="flex shrink-0 items-center gap-2 self-start rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      </section>

      {/* ── Plan History ── */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-extrabold text-slate-900">Plan history</h2>

        {plansLoading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-12 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
              <p className="text-sm font-medium text-slate-500">Loading plan history…</p>
            </div>
          </div>
        ) : plansError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">{plansError}</p>
          </div>
        ) : planHistory.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-400">
              No workout history yet. Completed, removed, and replaced plans will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {planHistory.map((plan) => (
              <HistoryPlanCard
                key={plan.id}
                plan={plan}
                onSelect={onSelectPlan}
                onPermanentlyDelete={(planId) => void handlePermanentlyDelete(planId)}
                isActionInProgress={deletingPlanId === plan.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Daily Workout History ── */}
      <section>
        <h2 className="mb-4 text-xl font-extrabold text-slate-900">Daily workout history</h2>

        {!dailyLoading && dailyEntries.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            {[
              { label: "Completed", value: completedCount },
              { label: "Total min", value: totalMinutes },
              { label: "Avg min", value: avgMinutes },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <p className="text-3xl font-extrabold text-slate-900">{value}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {dailyLoading ? (
            <p className="p-8 text-center text-slate-400">Loading daily history…</p>
          ) : dailyError ? (
            <p className="p-8 text-center text-red-500">{dailyError}</p>
          ) : dailyEntries.length === 0 ? (
            <p className="p-8 text-center text-slate-400">
              No workout history yet. Completed, removed, and replaced plans will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Workout</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyEntries.map((entry) => (
                    <tr
                      key={`${entry.planId}:${entry.date}`}
                      className="border-b border-slate-50 transition hover:bg-slate-50 last:border-0"
                    >
                      <td className="px-6 py-4 text-slate-500">{formatDailyDate(entry.date)}</td>
                      <td className="px-6 py-4 text-slate-600">{entry.planTitle}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{entry.dayTitle}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            entry.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {entry.status === "completed" ? "Done" : "Missed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        {entry.durationMinutes > 0 ? `${entry.durationMinutes} min` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {shareOpen && (
        <ShareModal
          title="Share Workout History"
          target={historyTarget}
          onClose={() => setShareOpen(false)}
        />
      )}
    </main>
  );
}

export default WorkoutHistoryPage;
