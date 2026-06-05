import type { ProgressSummary } from "../progress.models";
import { AnimatedCounter } from "../../userManagement/UserProfile/AnimatedCounter";
interface ProgressOverviewProps {
  summary: ProgressSummary;
}

interface StatTileProps {
  label: string;
  value: string;
  sub: string;
  emoji: string;
  color: string;
  bg: string;
}

function StatTile({ label, value, sub, emoji, color, bg }: StatTileProps) {
  const numericValue = parseInt(value, 10) || 0;
  return (
    <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${color} text-sm`}>
          {emoji}
        </div>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
            <AnimatedCounter target={numericValue} />
        </span>
        <span className="text-sm font-medium text-slate-500 ml-1">{sub}</span>
      </div>
    </div>
  );
}

export function ProgressOverview({ summary }: ProgressOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <StatTile 
        label="Current Streak" 
        value={summary.currentStreak.toString()} 
        sub="days" 
        emoji="🔥" 
        color="text-orange-500" 
        bg="bg-orange-100" 
      />
      <StatTile 
        label="Longest Streak" 
        value={summary.longestStreak.toString()} 
        sub="days" 
        emoji="👑" 
        color="text-yellow-600" 
        bg="bg-yellow-100" 
      />
      <StatTile 
        label="Workouts" 
        value={summary.totalWorkouts.toString()} 
        sub="sessions" 
        emoji="🏋️" 
        color="text-blue-500" 
        bg="bg-blue-100" 
      />
      <StatTile 
        label="Time Moved" 
        value={Math.floor(summary.totalMinutes / 60).toString()} 
        sub="hours" 
        emoji="⏱️" 
        color="text-purple-500" 
        bg="bg-purple-100" 
      />
    </div>
  );
}