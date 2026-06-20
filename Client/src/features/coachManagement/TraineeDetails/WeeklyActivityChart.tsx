interface WeeklyActivityChartProps {
  weeklyActivity: number[];
}

export function WeeklyActivityChart({ weeklyActivity }: WeeklyActivityChartProps) {
  const safeActivity =
    Array.isArray(weeklyActivity) && weeklyActivity.length === 7
      ? weeklyActivity
      : [0, 0, 0, 0, 0, 0, 0];
  const total = safeActivity.reduce((sum, v) => sum + v, 0);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">Weekly activity</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-[#9E97AF]">
        Total activities this week:{" "}
        <span className="font-bold text-slate-700 dark:text-[#C9C4D6]">{total}</span>
      </p>

      <div className="mt-6 grid grid-cols-7 gap-2">
        {safeActivity.map((value, index) => (
          <div key={index} className="text-center">
            <div
              className={`mx-auto flex h-20 items-end justify-center rounded-2xl px-2 ${
                value > 0 ? "bg-purple-100 dark:bg-purple-900/20" : "bg-slate-100 dark:bg-[#2A2436]"
              }`}
            >
              <div
                className={`w-full rounded-xl ${value > 0 ? "bg-purple-500" : "bg-slate-300 dark:bg-[#3B344A]"}`}
                style={{ height: `${Math.max(value * 25, 10)}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-500 dark:text-[#9E97AF]">Day {index + 1}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default WeeklyActivityChart;
