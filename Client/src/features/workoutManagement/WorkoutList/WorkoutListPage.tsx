import { useState, useEffect } from "react";
import { useWorkoutList } from "./useWorkoutList";
import { WorkoutCard } from "./WorkoutCard";
import { exportService } from "../exportService";
import { progressService } from "../../progressManagement/progressService";
import type { WorkoutHistoryItem } from "../../progressManagement/progress.models";
import { useAuth } from "../../../app/AuthContext";

// ─── Hook: load workout history ───────────────────────────────────────────────

const FALLBACK_HISTORY: WorkoutHistoryItem[] = [
  { id: "h1", date: "2025-06-01", durationMinutes: 45, challengeTitle: "Upper Body Strength" },
  { id: "h2", date: "2025-05-29", durationMinutes: 30, challengeTitle: "Core Blast"          },
  { id: "h3", date: "2025-05-27", durationMinutes: 60, challengeTitle: "Full Body HIIT"      },
  { id: "h4", date: "2025-05-24", durationMinutes: 40, challengeTitle: "Lower Body Power"    },
  { id: "h5", date: "2025-05-22", durationMinutes: 35, challengeTitle: "Cardio Endurance"    },
];

function useWorkoutHistory() {
  const { token } = useAuth();
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    (async () => {
      try {
        const data = await progressService.getWorkoutHistory(token);
        setHistory(data);
      } catch {
        // TODO: remove fallback when backend is connected
        console.warn("[DEV] getWorkoutHistory failed — using fallback.");
        setHistory(FALLBACK_HISTORY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { history, isLoading };
}

// ─── Workout history section ──────────────────────────────────────────────────

function WorkoutHistorySection({ history, isLoading }: { history: WorkoutHistoryItem[]; isLoading: boolean }) {
  const totalMinutes = history.reduce((sum, h) => sum + h.durationMinutes, 0);
  const totalWorkouts = history.length;

  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">History</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">Workout history</h2>
          <p className="mt-1 text-sm text-slate-500">Your completed sessions — exported with the summary above.</p>
        </div>

        {/* Summary stats */}
        {!isLoading && history.length > 0 && (
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{totalWorkouts}</p>
              <p className="text-xs font-bold text-slate-400">Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{totalMinutes}</p>
              <p className="text-xs font-bold text-slate-400">Total min</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                {totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0}
              </p>
              <p className="text-xs font-bold text-slate-400">Avg min</p>
            </div>
          </div>
        )}
      </div>

      {/* Table body */}
      {isLoading ? (
        <p className="p-6 text-center text-sm text-slate-400">Loading history…</p>
      ) : history.length === 0 ? (
        <p className="p-6 text-center text-sm text-slate-400">
          No workout history yet. Complete your first session to see it here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Workout</th>
                <th className="px-6 py-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 transition hover:bg-slate-50 last:border-0"
                >
                  <td className="px-6 py-4 text-slate-400 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(item.date).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.challengeTitle}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    {item.durationMinutes} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Export panel ─────────────────────────────────────────────────────────────

function ExportPanel({ history }: { history: WorkoutHistoryItem[] }) {
  const { token } = useAuth();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handlePdf() {
    if (!token) return;
    setStatus("loading");
    setMessage("");
    try {
      // TODO: remove alert and uncomment when backend is ready
      // const { downloadUrl } = await exportService.downloadPdf(token);
      // window.open(downloadUrl, "_blank");
      console.log("Export PDF — history rows:", history.length);
      alert("PDF export will be available once the backend is connected.");
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Could not generate PDF. Please try again later.");
    }
  }

  async function handleEmail() {
    if (!token || !email.trim()) return;
    setStatus("loading");
    setMessage("");
    try {
      // TODO: remove alert and uncomment when backend is ready
      // await exportService.sendByEmail({ email: email.trim() }, token);
      console.log("Export Email — history rows:", history.length);
      alert(`Summary will be sent to ${email} once the backend is connected.`);
      setStatus("success");
      setMessage(`Summary will be sent to ${email}`);
      setShowEmailInput(false);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Could not send email. Please try again later.");
    }
  }

  return (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="mb-1 text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Export</p>
      <h2 className="text-xl font-extrabold text-slate-900">Save your workout summary</h2>
      <p className="mt-1 text-sm text-slate-500">
        Download a PDF of your history or send it directly to your inbox.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePdf}
          disabled={status === "loading"}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          Export as PDF
        </button>

        <button
          type="button"
          onClick={() => setShowEmailInput((v) => !v)}
          className="flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          Send by Email
        </button>
      </div>

      {showEmailInput && (
        <div className="mt-4 flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
          />
          <button
            type="button"
            onClick={handleEmail}
            disabled={!email.trim() || status === "loading"}
            className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}

      {message && (
        <p className={`mt-3 text-sm font-medium ${status === "error" ? "text-red-500" : "text-emerald-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function WorkoutListPage() {
  const { workouts, isLoading, error } = useWorkoutList();
  const { history, isLoading: historyLoading } = useWorkoutHistory();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading workouts…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Workouts</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Your workouts</h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          Select a workout to start your session. New plans are generated daily by Budi.
        </p>
      </section>

      {/* Export panel — receives history so backend can include it in the export */}
      <ExportPanel history={history} />

      {/* Workout history table */}
      <WorkoutHistorySection history={history} isLoading={historyLoading} />

      {/* Upcoming / available workouts */}
      {workouts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-slate-900">No workouts yet</p>
          <p className="mt-3 text-slate-500">
            Workouts will appear here once the backend is connected and Budi generates your plan.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onSelect={(id) => alert(`Starting workout ${id} — detail view coming soon.`)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default WorkoutListPage;