import type { ProgressSummary } from "../progress.models";

interface DerivedAchievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  icon: string;
  accentColor: string;
}

interface Props {
  summary: ProgressSummary | null;
  streak: number;
}

function derivedAchievements(
  summary: ProgressSummary | null,
  streak: number
): DerivedAchievement[] {
  const total = summary?.totalWorkouts ?? 0;
  const minutes = summary?.totalMinutes ?? 0;
  const currentStreak = summary?.currentStreak ?? streak;

  return [
    {
      id: "first_workout",
      title: "First Workout",
      description: "Complete your first workout session.",
      earned: total >= 1,
      icon: "🏋️",
      accentColor: "#7C3AED",
    },
    {
      id: "streak_3",
      title: "3-Day Streak",
      description: "Work out 3 days in a row.",
      earned: currentStreak >= 3,
      icon: "🔥",
      accentColor: "#F59E0B",
    },
    {
      id: "challenges_5",
      title: "5 Challenges Done",
      description: "Complete 5 workout sessions.",
      earned: total >= 5,
      icon: "🏆",
      accentColor: "#3B82F6",
    },
    {
      id: "time_10h",
      title: "10 Hours Moved",
      description: "Accumulate 10 hours of workout time.",
      earned: minutes >= 600,
      icon: "⏱️",
      accentColor: "#10B981",
    },
  ];
}

interface AchievementTileProps {
  achievement: DerivedAchievement;
}

function AchievementTile({ achievement }: AchievementTileProps) {
  const { earned, icon, title, description, accentColor } = achievement;

  return (
    <div
      className={`relative rounded-2xl border bg-white p-5 flex flex-col gap-3 transition-all dark:bg-[#211D2B] ${
        earned
          ? "border-slate-200 shadow-sm dark:border-[#3B344A]"
          : "border-slate-100 opacity-55 dark:border-[#3B344A]"
      }`}
    >
      {earned && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30">
          ✓ Earned
        </div>
      )}
      {!earned && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-slate-100 px-2 py-1 rounded-full dark:bg-[#2A2436] dark:text-[#9E97AF]">
          Locked
        </div>
      )}

      <div className="relative self-start">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${!earned ? "bg-slate-100 dark:bg-[#2A2436]" : ""}`}
          style={
            earned
              ? {
                  backgroundColor: `${accentColor}18`,
                  boxShadow: `0 4px 14px ${accentColor}30`,
                }
              : undefined
          }
        >
          {icon}
        </div>
        {!earned && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] leading-none dark:bg-[#2A2436] dark:border-[#211D2B]">
            🔒
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 leading-tight dark:text-[#F8F7FB]">{title}</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed dark:text-[#9E97AF]">{description}</p>
      </div>
    </div>
  );
}

export function DerivedAchievements({ summary, streak }: Props) {
  const achievements = derivedAchievements(summary, streak);
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div>
      <p className="text-xs text-slate-400 mb-3 dark:text-[#9E97AF]">
        {earnedCount} of {achievements.length} earned
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((a) => (
          <AchievementTile key={a.id} achievement={a} />
        ))}
      </div>
    </div>
  );
}
