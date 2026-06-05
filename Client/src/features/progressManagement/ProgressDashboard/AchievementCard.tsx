import type { Achievement } from "../user.models";

interface AchievementCardProps {
  achievement: Achievement;
}

const ICON_MAP: Record<string, string> = {
  flame: "🔥",
  clock: "⏱️",
  dumbbell: "🏋️",
  trophy: "🏆",
};

export function AchievementCard({ achievement }: AchievementCardProps) {
  const icon = ICON_MAP[achievement.icon] ?? "🏅";

  return (
    <div
      className={`p-5 rounded-2xl border ${
        achievement.earned
          ? "bg-white border-slate-200 shadow-sm"
          : "bg-slate-50 border-slate-100 opacity-60"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 text-2xl ${
          achievement.earned ? "bg-purple-100" : "bg-slate-200"
        }`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-slate-900">{achievement.title}</h3>
      <p className="text-sm text-slate-500 mt-1">{achievement.description}</p>
      {achievement.earned && (
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
          ✓ Earned
        </div>
      )}
    </div>
  );
}

export default AchievementCard;
