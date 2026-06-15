import { useState, useEffect } from "react";
import { progressService } from "../../progressManagement/progressService";
import type { WorkoutHistoryItem } from "../../progressManagement/progress.models";
import { workoutService } from "../workoutService";
import type { GeneratedWorkoutPlanSummary } from "../workout.models";
import { GeneratedWorkoutPlanCard } from "../WorkoutList/GeneratedWorkoutPlanCard";
import { useAuth } from "../../../app/AuthContext";
import { ShareModal } from "../ShareModal";

// ─── Page ─────────────────────────────────────────────────────────────────────

interface WorkoutHistoryPageProps {
  onBack: () => void;
  onSelectPlan: (planId: string) => void;
}

function WorkoutHistoryPage({ onBack, onSelectPlan }: WorkoutHistoryPageProps) {
  const { token } = useAuth();

  const [completedPlans, setCompletedPlans] = useState<GeneratedWorkoutPlanSummary[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");

  const [sessions, setSessions] = useState<WorkoutHistoryItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState("");

  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      setPlansLoading(false);
      setSessionsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await workoutService.getCompletedWorkoutPlans(token);
        setCompletedPlans(data);
      } catch (err) {
        console.error("[WORKOUT] Failed to load completed plans:", err);
        setPlansError("Failed to load completed workout plans.");
      } finally {
        setPlansLoading(false);
      }
    })();

    (async () => {
      try {
        const data = await progressService.getWorkoutHistory(token);
        setSessions(data);
      } catch (err) {
        console.error("[WORKOUT] Failed to load workout history:", err);
        setSessionsError("Failed to load session history.");
      } finally {
        setSessionsLoading(false);
      }
    })();
  }, [token]);

  const totalMinutes = sessions.reduce((sum, h) => sum + h.durationMinutes, 0);
  const avgMinutes = sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0;

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
            Your completed workout plans and sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex shrink-0 items-center gap-2 self-start rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      </section>

      {/* ── Completed Plans ── */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-extrabold text-slate-900">Completed plans</h2>

        {plansLoading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-12 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
              <p className="text-sm font-medium text-slate-500">Loading completed plans…</p>
            </div>
          </div>
        ) : plansError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">{plansError}</p>
          </div>
        ) : completedPlans.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-400">
              No completed workout plans yet. Complete a plan to see it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {completedPlans.map((plan) => (
              <GeneratedWorkoutPlanCard
                key={plan.id}
                plan={plan}
                onSelect={onSelectPlan}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Session History ── */}
      <section>
        <h2 className="mb-4 text-xl font-extrabold text-slate-900">Session history</h2>

        {!sessionsLoading && sessions.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            {[
              { label: "Sessions",  value: sessions.length },
              { label: "Total min", value: totalMinutes    },
              { label: "Avg min",   value: avgMinutes      },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <p className="text-3xl font-extrabold text-slate-900">{value}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {sessionsLoading ? (
            <p className="p-8 text-center text-slate-400">Loading sessions…</p>
          ) : sessionsError ? (
            <p className="p-8 text-center text-red-500">{sessionsError}</p>
          ) : sessions.length === 0 ? (
            <p className="p-8 text-center text-slate-400">
              No session history yet. Complete a session to see it here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Workout</th>
                    <th className="px-6 py-4 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-50 transition hover:bg-slate-50 last:border-0">
                      <td className="px-6 py-4 font-medium text-slate-400">{index + 1}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(item.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{item.challengeTitle}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">{item.durationMinutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {shareOpen && <ShareModal title="Share — Workout History" onClose={() => setShareOpen(false)} />}
    </main>
  );
}

export default WorkoutHistoryPage;
