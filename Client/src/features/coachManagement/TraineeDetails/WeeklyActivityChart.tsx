interface WeeklyActivityChartProps {
  weeklyActivity: number[];
}

export function WeeklyActivityChart({ weeklyActivity }: WeeklyActivityChartProps) {
  const total = weeklyActivity.reduce((sum, v) => sum + v, 0);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-extrabold text-slate-900">Weekly activity</h2>
      <p className="mt-2 text-sm text-slate-500">
        Total activities this week:{" "}
        <span className="font-bold text-slate-700">{total}</span>
      </p>

      <div className="mt-6 grid grid-cols-7 gap-2">
        {weeklyActivity.map((value, index) => (
          <div key={index} className="text-center">
            <div
              className={`mx-auto flex h-20 items-end justify-center rounded-2xl px-2 ${
                value > 0 ? "bg-purple-100" : "bg-slate-100"
              }`}
            >
              <div
                className={`w-full rounded-xl ${value > 0 ? "bg-purple-500" : "bg-slate-300"}`}
                style={{ height: `${Math.max(value * 25, 10)}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-500">Day {index + 1}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default WeeklyActivityChart;
