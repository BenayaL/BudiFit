import type { Page } from "../../../app/app.types";
import { useProgressDashboardData, useDailyWorkout } from "./useProgressDashboardData";
import { ProgressOverview } from "./ProgressOverview";
import { TodayChallengeHero } from "./TodayChallengeHero";
import { BudiMotivationCard } from "./BudiMotivationCard";
import { WeeklyProgressStrip } from "./WeeklyProgressStrip";
import { ActiveChallengesGrid } from "./ActiveChallengesGrid";
import { DerivedAchievements } from "./DerivedAchievements";
import { ShareProgressCard } from "./ShareProgressCard";

interface Props {
  onChangePage: (page: Page) => void;
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeader({
  label,
  title,
  hint,
}: {
  label: string;
  title?: string;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#9E97AF]">{label}</p>
      {title && (
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 mt-1 leading-tight dark:text-[#F8F7FB]">
          {title}
        </h2>
      )}
      {hint && <p className="text-xs text-slate-400 mt-0.5 dark:text-[#9E97AF]">{hint}</p>}
    </div>
  );
}

// ─── Mini week summary card (right column) ────────────────────────────────────

function MiniWeekCard({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));
  const doneAll = total > 0 && completed >= total;
  const remaining = total - completed;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:border-[#3B344A] dark:bg-[#211D2B]">
      <div className="h-[5px] w-full bg-gradient-to-r from-blue-400 to-cyan-400" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#9E97AF]">
            This Week
          </p>
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              doneAll
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-slate-100 text-slate-500 dark:bg-[#2A2436] dark:text-[#9E97AF]"
            }`}
          >
            {doneAll ? "✓ Goal met" : `${completed} / ${total}`}
          </span>
        </div>

        <div className="h-[5px] bg-slate-100 rounded-full overflow-hidden mb-3 dark:bg-[#2A2436]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: doneAll
                ? "linear-gradient(90deg,#10B981,#34D399)"
                : "linear-gradient(90deg,#7C3AED,#A855F7)",
            }}
          />
        </div>

        <p className="text-xs text-slate-400 leading-snug dark:text-[#9E97AF]">
          {total === 0
            ? "No workouts scheduled this week"
            : doneAll
            ? "Great work — weekly goal completed."
            : `${remaining} workout${remaining > 1 ? "s" : ""} remaining this week`}
        </p>
      </div>
    </div>
  );
}

// ─── Header status pill ───────────────────────────────────────────────────────

function TodayStatusPill({
  isCompleted,
  isRestDay,
  hasActivePlan,
}: {
  isCompleted: boolean;
  isRestDay: boolean;
  hasActivePlan: boolean;
}) {
  if (!hasActivePlan) return null;

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Today completed
      </span>
    );
  }
  if (isRestDay) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:border-[#3B344A] dark:bg-[#211D2B] dark:text-[#9E97AF]">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Rest day
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 dark:border-violet-800/50 dark:bg-violet-900/20 dark:text-violet-400">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
      Ready for today
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ProgressDashboardPage({ onChangePage }: Props) {
  const { summary, weekEntries, isSummaryLoading, isCalendarLoading, summaryError } =
    useProgressDashboardData();
  const { dashboard, isCompleting, completeToday } = useDailyWorkout();

  const streak = dashboard?.streak ?? summary?.currentStreak ?? 0;
  const isCompleted = !!dashboard?.today?.completion;
  const hasActivePlan = !!dashboard?.activePlan;
  const isRestDay = dashboard?.today?.planDay?.restDay ?? false;

  const weekCompleted = weekEntries.filter((e) => e.isCompleted).length;
  const weekTotal = weekEntries.filter((e) => e.isWorkoutDay).length;

  // ── Loading ──
  if (isSummaryLoading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="text-sm text-slate-500 dark:text-[#9E97AF]">Loading your progress…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (summaryError && !summary) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-4 dark:text-[#F8F7FB]">
          Progress Dashboard
        </h1>
        <div className="rounded-2xl bg-red-50 border border-red-200 p-5 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400">
          {summaryError}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#9E97AF]">Progress</p>
          <h1 className="text-2xl sm:text-[2rem] font-extrabold tracking-tight text-slate-950 leading-tight mt-1.5 dark:text-[#F8F7FB]">
            Progress Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-md dark:text-[#9E97AF]">
            Track your consistency, challenges, and workout progress.
          </p>
        </div>
        <TodayStatusPill
          isCompleted={isCompleted}
          isRestDay={isRestDay}
          hasActivePlan={hasActivePlan}
        />
      </div>

      {/* ── Hero grid: Today card (2/3) + right stack (1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2">
          <TodayChallengeHero
            dashboard={dashboard}
            isCompleting={isCompleting}
            onComplete={completeToday}
            onChangePage={onChangePage}
          />
        </div>
        <div className="flex flex-col gap-4">
          <BudiMotivationCard
            streak={streak}
            isCompleted={isCompleted}
            hasActivePlan={hasActivePlan}
          />
          <MiniWeekCard completed={weekCompleted} total={weekTotal} />
        </div>
      </div>

      {/* ── Stats ── */}
      {summary && (
        <ProgressOverview
          summary={summary}
          weeklyProgress={{ completed: weekCompleted, total: weekTotal }}
        />
      )}

      {/* ── Weekly tracker ── */}
      <section>
        <SectionHeader label="Weekly Tracker" title="This Week" />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 dark:border-[#3B344A] dark:bg-[#211D2B]">
          <WeeklyProgressStrip entries={weekEntries} isLoading={isCalendarLoading} />
        </div>
      </section>

      {/* ── Active Challenges ── */}
      <section>
        <SectionHeader
          label="Challenges"
          title="Active Challenges"
          hint="XP is motivational only — not stored"
        />
        <ActiveChallengesGrid
          dashboard={dashboard}
          weekEntries={weekEntries}
          streak={streak}
        />
      </section>

      {/* ── Achievements ── */}
      <section>
        <SectionHeader label="Achievements" />
        <DerivedAchievements summary={summary} streak={streak} />
      </section>

      {/* ── Share ── */}
      <ShareProgressCard />
    </main>
  );
}

export default ProgressDashboardPage;
