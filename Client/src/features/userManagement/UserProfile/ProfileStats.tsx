import type { UserProfile } from "../user.models";

interface ProfileStatsProps {
  user: UserProfile;
  earnedAchievementCount: number;
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
  return (
    <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${color} text-sm`}>
          {emoji}
        </div>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">{value}</span>
        <span className="text-sm font-medium text-slate-500 ml-1">{sub}</span>
      </div>
    </div>
  );
}

export function ProfileStats({ user, earnedAchievementCount }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <StatTile label="Day Streak" value={user.streak.toString()} sub="days" emoji="🔥" color="text-orange-500" bg="bg-orange-100" />
      <StatTile label="Workouts" value={user.totalWorkouts.toString()} sub="sessions" emoji="🏋️" color="text-blue-500" bg="bg-blue-100" />
      <StatTile label="Time Moved" value={Math.round(user.totalMinutes / 60).toString()} sub="hours" emoji="⏱️" color="text-emerald-500" bg="bg-emerald-100" />
      <StatTile label="Badges" value={`${earnedAchievementCount}/${user.achievements.length}`} sub="earned" emoji="🏆" color="text-purple-500" bg="bg-purple-100" />
    </div>
  );
}

export default ProfileStats;
