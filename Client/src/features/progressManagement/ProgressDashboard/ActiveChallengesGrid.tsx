import type { DailyDashboard } from "../../workoutManagement/DailyWorkout/dailyWorkout.models";
import type { CalendarEntry } from "../../workoutManagement/DailyWorkout/dailyWorkout.models";

interface Props {
  dashboard: DailyDashboard | null;
  weekEntries: CalendarEntry[];
  streak: number;
}

interface ChallengeCardProps {
  icon: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  isComplete: boolean;
  reward: string;
  accentColor: string;
  accentColorLight: string;
  barGradient: string;
  iconBg: string;
}

function ChallengeCard({
  icon,
  title,
  description,
  progress,
  total,
  isComplete,
  reward,
  accentColorLight,
  barGradient,
  iconBg,
}: ChallengeCardProps) {
  const pct = total === 0 ? 2 : Math.max(2, Math.min(100, Math.round((progress / total) * 100)));

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 dark:bg-[#211D2B] ${
        isComplete
          ? "border-emerald-200 dark:border-emerald-800/40"
          : "border-slate-200 dark:border-[#3B344A]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl flex-shrink-0 ${
            isComplete ? "bg-emerald-50 dark:bg-emerald-900/20" : iconBg
          }`}
          style={!isComplete ? { backgroundColor: accentColorLight } : undefined}
        >
          {isComplete ? "✅" : icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight dark:text-[#F8F7FB]">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug dark:text-[#9E97AF]">{description}</p>
        </div>
      </div>

      <div>
        <div className="h-[5px] rounded-full bg-slate-100 overflow-hidden dark:bg-[#2A2436]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: isComplete
                ? "linear-gradient(90deg,#10B981,#34D399)"
                : barGradient,
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-slate-400 dark:text-[#9E97AF]">
            {isComplete ? "Goal reached!" : `${progress} / ${total}`}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9E97AF]">{pct}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
            isComplete
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "bg-slate-100 text-slate-500 dark:bg-[#2A2436] dark:text-[#9E97AF]"
          }`}
        >
          {isComplete ? "✓ Done" : "Active"}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          {reward}
        </span>
      </div>
    </div>
  );
}

export function ActiveChallengesGrid({ dashboard, weekEntries, streak }: Props) {
  const today = dashboard?.today;
  const planDay = today?.planDay;
  const isRestDay = planDay?.restDay ?? true;
  const hasWorkoutToday = !!planDay && !isRestDay;
  const isTodayCompleted = !!today?.completion;

  const dailyProgress = isTodayCompleted ? 1 : 0;
  const dailyTotal = hasWorkoutToday ? 1 : 0;
  const dailyIsComplete = hasWorkoutToday && isTodayCompleted;

  const weekCompleted = weekEntries.filter((e) => e.isCompleted).length;
  const weekTotal = weekEntries.filter((e) => e.isWorkoutDay).length;

  const streakGoal = 3;
  const streakProgress = Math.min(streak, streakGoal);
  const streakComplete = streak >= streakGoal;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <ChallengeCard
        icon="🏋️"
        title="Daily Challenge"
        description="Complete today's workout"
        progress={dailyProgress}
        total={Math.max(dailyTotal, 1)}
        isComplete={dailyIsComplete}
        reward="+20 XP"
        accentColor="#7C3AED"
        accentColorLight="#7C3AED18"
        barGradient="linear-gradient(90deg,#7C3AED,#A855F7)"
        iconBg="bg-violet-50"
      />
      <ChallengeCard
        icon="📅"
        title="Weekly Consistency"
        description={`${weekCompleted} of ${weekTotal} workouts this week`}
        progress={weekCompleted}
        total={Math.max(weekTotal, 1)}
        isComplete={weekTotal > 0 && weekCompleted >= weekTotal}
        reward="+50 XP"
        accentColor="#3B82F6"
        accentColorLight="#3B82F618"
        barGradient="linear-gradient(90deg,#3B82F6,#60A5FA)"
        iconBg="bg-blue-50"
      />
      <ChallengeCard
        icon="🔥"
        title="Streak Builder"
        description="Maintain a 3-day streak"
        progress={streakProgress}
        total={streakGoal}
        isComplete={streakComplete}
        reward="+30 XP"
        accentColor="#F59E0B"
        accentColorLight="#F59E0B18"
        barGradient="linear-gradient(90deg,#F59E0B,#FCD34D)"
        iconBg="bg-amber-50"
      />
    </div>
  );
}
