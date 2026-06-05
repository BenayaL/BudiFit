import { useState } from "react";
import { useWorkoutList } from "./useWorkoutList";
import { WorkoutCard } from "./WorkoutCard";
import { useAuth } from "../../../app/AuthContext";

// ─── Reusable share modal ─────────────────────────────────────────────────────

interface ShareModalProps {
  title: string;
  onClose: () => void;
}

function ShareModal({ title, onClose }: ShareModalProps) {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [sent, setSent] = useState(false);

  function handlePdf() {
    // TODO: uncomment when backend ready
    // const { downloadUrl } = await exportService.downloadPdf(token);
    // window.open(downloadUrl, "_blank");
    alert("PDF export will be available once the backend is connected.");
  }

  function handleSend() {
    if (!email.trim()) return;
    // TODO: await exportService.sendByEmail({ email }, token);
    alert(`Will be sent to ${email} once the backend is connected.`);
    setSent(true);
    setEmail("");
    setShowEmail(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">Share — {title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* PDF */}
          <button
            type="button"
            onClick={handlePdf}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Export as PDF
          </button>

          {/* Email */}
          {!showEmail ? (
            <button
              type="button"
              onClick={() => setShowEmail(true)}
              className="flex w-full items-center gap-3 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Send by Email
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!email.trim()}
                className="rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          )}

          {sent && <p className="text-center text-sm font-medium text-emerald-600">Sent successfully!</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface WorkoutListPageProps {
  onGoToHistory: () => void;
}

function WorkoutListPage({ onGoToHistory }: WorkoutListPageProps) {
  const { workouts, isLoading, error } = useWorkoutList();
  const [shareOpen, setShareOpen] = useState(false);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading workouts…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      {/* ── Header ── */}
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Workouts</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Your workouts</h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Select a workout to start your session. New plans are generated daily by Budi.
          </p>
        </div>

        {/* Right side actions */}
        <div className="flex shrink-0 items-center gap-3">
          {/* History button */}
          <button
            type="button"
            onClick={onGoToHistory}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="12 8 12 12 14 14" />
              <path d="M3.05 11a9 9 0 1 1 .5 4M3 15v-4h4" />
            </svg>
            View history
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700"
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

      {/* ── Workout cards ── */}
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

      {/* ── Share modal ── */}
      {shareOpen && (
        <ShareModal title="Workout Plans" onClose={() => setShareOpen(false)} />
      )}
    </main>
  );
}

export default WorkoutListPage;