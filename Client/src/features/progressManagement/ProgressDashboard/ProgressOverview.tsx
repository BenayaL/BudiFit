import { Flame, Dumbbell, CalendarDays, Timer } from "lucide-react";
import type { ProgressSummary } from "../progress.models";
import { AnimatedCounter } from "../../userManagement/UserProfile/AnimatedCounter";

interface ProgressOverviewProps {
  summary: ProgressSummary;
  weeklyProgress?: { completed: number; total: number };
}

interface StatTileProps {
  label: string;
  numericValue: number;
  unit: string;
  helperText: string;
  icon: React.ReactNode;
  iconBg: string;
}

function StatTile({ label, numericValue, unit, helperText, icon, iconBg }: StatTileProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 overflow-hidden">
      {/* Icon — absolute top-right */}
      <div
        className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
      >
        {icon}
      </div>

      {/* Label */}
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 pr-12 leading-none">
        {label}
      </p>

      {/* Value + unit */}
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold tracking-tight text-slate-950 tabular-nums leading-none">
          <AnimatedCounter target={numericValue} />
        </span>
        <span className="text-sm font-medium text-slate-400">{unit}</span>
      </div>

      {/* Helper */}
      <p className="mt-2 text-xs text-slate-400 leading-snug">{helperText}</p>
    </div>
  );
}

// Weekly Progress tile — same structure but shows fraction instead of animated counter
function WeeklyTile({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));
  const doneAll = total > 0 && completed >= total;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 overflow-hidden">
      <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
        <CalendarDays size={18} className="text-blue-500" />
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 pr-12 leading-none">
        Weekly Progress
      </p>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold tracking-tight text-slate-950 tabular-nums leading-none">
          {completed}
        </span>
        <span className="text-sm font-medium text-slate-400">of {total}</span>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        {doneAll ? "Weekly goal reached 🎉" : `${pct}% of weekly sessions done`}
      </p>
    </div>
  );
}

export function ProgressOverview({ summary, weeklyProgress }: ProgressOverviewProps) {
  const wCompleted = weeklyProgress?.completed ?? 0;
  const wTotal = weeklyProgress?.total ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatTile
        label="Current Streak"
        numericValue={summary.currentStreak}
        unit="days"
        helperText={`Best: ${summary.longestStreak} day${summary.longestStreak !== 1 ? "s" : ""}`}
        icon={<Flame size={18} className="text-amber-500" />}
        iconBg="bg-amber-50"
      />
      <StatTile
        label="Challenges Done"
        numericValue={summary.totalWorkouts}
        unit="sessions"
        helperText="All-time completed"
        icon={<Dumbbell size={18} className="text-violet-500" />}
        iconBg="bg-violet-50"
      />
      <WeeklyTile completed={wCompleted} total={wTotal} />
      <StatTile
        label="Total Time"
        numericValue={Math.floor(summary.totalMinutes / 60)}
        unit="hours"
        helperText={`${summary.totalWorkouts} session${summary.totalWorkouts !== 1 ? "s" : ""} total`}
        icon={<Timer size={18} className="text-emerald-500" />}
        iconBg="bg-emerald-50"
      />
    </div>
  );
}
