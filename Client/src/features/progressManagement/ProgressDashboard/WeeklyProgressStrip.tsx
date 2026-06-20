import type { CalendarEntry } from "../../workoutManagement/DailyWorkout/dailyWorkout.models";

interface Props {
  entries: CalendarEntry[];
  isLoading: boolean;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DayConfig {
  bg: string;
  border: string;
  dateFg: string;
  marker: string;
  markerFg: string;
  gradient?: string;
}

function getDayConfig(entry: CalendarEntry): DayConfig {
  if (entry.isCompleted) {
    return {
      bg: "",
      border: "border-emerald-200",
      dateFg: "text-white",
      marker: "✓",
      markerFg: "text-white font-bold",
      gradient: "linear-gradient(150deg,#10B981,#34D399)",
    };
  }
  if (entry.isMissed) {
    return {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-100 dark:border-red-800/30",
      dateFg: "text-slate-500 dark:text-[#9E97AF]",
      marker: "✗",
      markerFg: "text-red-300 font-semibold",
    };
  }
  if (entry.isWorkoutDay && entry.isFuture) {
    return {
      bg: "bg-violet-50 dark:bg-purple-900/20",
      border: "border-violet-100 dark:border-purple-800/30",
      dateFg: "text-slate-700 dark:text-[#C9C4D6]",
      marker: "•",
      markerFg: "text-violet-400 font-bold text-base",
    };
  }
  if (entry.isWorkoutDay) {
    return {
      bg: "bg-slate-50 dark:bg-[#2A2436]",
      border: "border-slate-200 dark:border-[#3B344A]",
      dateFg: "text-slate-500 dark:text-[#9E97AF]",
      marker: "•",
      markerFg: "text-slate-300 font-bold text-base",
    };
  }
  return {
    bg: "bg-white dark:bg-[#2A2436]",
    border: "border-slate-100 dark:border-[#3B344A]",
    dateFg: "text-slate-400 dark:text-[#9E97AF]",
    marker: "—",
    markerFg: "text-slate-200 dark:text-[#3B344A]",
  };
}

const LEGEND = [
  { swatch: "linear-gradient(135deg,#10B981,#34D399)", label: "Completed" },
  { swatch: "bg-violet-50 border border-violet-200 dark:bg-purple-900/20 dark:border-purple-800/30", label: "Upcoming", isTw: true },
  { swatch: "", label: "Today", ring: true },
  { swatch: "bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-800/30", label: "Missed", isTw: true },
  { swatch: "bg-white border border-slate-100 dark:bg-[#2A2436] dark:border-[#3B344A]", label: "Rest", isTw: true },
];

export function WeeklyProgressStrip({ entries, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="grid grid-cols-7 gap-2.5 min-w-[520px]">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-[80px] rounded-xl bg-slate-100 animate-pulse dark:bg-[#2A2436]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="grid grid-cols-7 gap-2.5 min-w-[520px]">
          {entries.map((entry, i) => {
            const cfg = getDayConfig(entry);
            const dayNum = new Date(entry.date + "T00:00:00").getDate();
            const isToday = entry.isToday;

            return (
              <div
                key={entry.date}
                className={`h-[80px] rounded-xl border-2 flex flex-col items-center justify-between py-2.5 px-1 transition-all
                  ${cfg.bg} ${cfg.border}
                  ${isToday ? "ring-2 ring-violet-500 ring-offset-1 dark:ring-offset-[#211D2B]" : ""}`}
                style={cfg.gradient ? { background: cfg.gradient } : undefined}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider leading-none ${
                    isToday ? "text-violet-600" : cfg.gradient ? "text-white/80" : "text-slate-400 dark:text-[#9E97AF]"
                  }`}
                >
                  {DAY_LABELS[i]}
                </span>
                <span className={`text-base font-bold leading-none ${cfg.dateFg}`}>
                  {dayNum}
                </span>
                <span className={`text-xs leading-none ${cfg.markerFg}`}>
                  {cfg.marker}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-3 border-t border-slate-100 dark:border-[#3B344A]">
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            {item.ring ? (
              <div className="w-3 h-3 rounded-sm bg-white border-2 border-violet-500 flex-shrink-0 dark:bg-[#2A2436]" />
            ) : item.isTw ? (
              <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${item.swatch}`} />
            ) : (
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: item.swatch as string }}
              />
            )}
            <span className="text-[11px] text-slate-400 dark:text-[#9E97AF]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
