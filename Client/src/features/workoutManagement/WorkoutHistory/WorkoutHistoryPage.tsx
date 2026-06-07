import { useState, useEffect } from "react";
import { progressService } from "../../progressManagement/progressService";
import type { WorkoutHistoryItem } from "../../progressManagement/progress.models";
import { useAuth } from "../../../app/AuthContext";

// ─── Share modal (same component as WorkoutListPage) ─────────────────────────

function ShareModal({ onClose }: { onClose: () => void }) {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");

  function handlePdf() {
    alert("PDF export will be available once the backend is connected.");
  }
  function handleSend() {
    if (!email.trim()) return;
    alert(`Will be sent to ${email} once the backend is connected.`);
    setShowEmail(false);
    setEmail("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">Share — Workout History</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100">✕</button>
        </div>
        <div className="space-y-3">
          <button type="button" onClick={handlePdf} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Export as PDF
          </button>
          {!showEmail ? (
            <button type="button" onClick={() => setShowEmail(true)} className="flex w-full items-center gap-3 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Send by Email
            </button>
          ) : (
            <div className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15" />
              <button type="button" onClick={handleSend} disabled={!email.trim()}
                className="rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-50">
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface WorkoutHistoryPageProps {
  onBack: () => void;
}

function WorkoutHistoryPage({ onBack }: WorkoutHistoryPageProps) {
  const { token } = useAuth();
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    (async () => {
      try {
        const data = await progressService.getWorkoutHistory(token);
        setHistory(data);
      } catch (err) {
        console.error("[WORKOUT] Failed to load workout history:", err);
        setError("Failed to load workout history.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  const totalMinutes = history.reduce((sum, h) => sum + h.durationMinutes, 0);
  const avgMinutes = history.length > 0 ? Math.round(totalMinutes / history.length) : 0;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* ── Header ── */}
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button type="button" onClick={onBack}
            className="mb-4 flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-purple-600">
            ← Back to workouts
          </button>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">History</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Workout history</h1>
          <p className="mt-3 max-w-2xl text-slate-500">All your completed sessions in one place.</p>
        </div>

        <button type="button" onClick={() => setShareOpen(true)}
          className="flex shrink-0 items-center gap-2 self-start rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
      </section>

      {/* ── Stats ── */}
      {!isLoading && history.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Sessions",  value: history.length },
            { label: "Total min", value: totalMinutes   },
            { label: "Avg min",   value: avgMinutes     },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <p className="text-3xl font-extrabold text-slate-900">{value}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-slate-400">Loading history…</p>
        ) : error ? (
          <p className="p-8 text-center text-red-500">{error}</p>
        ) : history.length === 0 ? (
          <p className="p-8 text-center text-slate-400">No workout history yet. Complete a session to see it here.</p>
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
                {history.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-50 transition hover:bg-slate-50 last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-400">{index + 1}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
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

      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
    </main>
  );
}

export default WorkoutHistoryPage;