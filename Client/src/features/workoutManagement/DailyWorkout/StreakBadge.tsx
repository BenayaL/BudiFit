interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-orange-200 bg-gradient-to-b from-orange-50 to-amber-50 px-6 py-5 shadow-sm dark:border-orange-700/40 dark:from-orange-900/20 dark:to-amber-900/20">
      <span className="text-4xl" role="img" aria-label="fire">
        🔥
      </span>
      <span className="mt-2 text-3xl font-extrabold text-orange-600">
        {streak}
      </span>
      <span className="mt-1 text-xs font-bold uppercase tracking-widest text-orange-400">
        day streak
      </span>
    </div>
  );
}
