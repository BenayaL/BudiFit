import { useState, useEffect } from "react";
import { useAuth } from "../../../app/AuthContext";
import { dailyWorkoutService } from "./dailyWorkoutService";
import type { CalendarEntry } from "./dailyWorkout.models";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function prevMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function entryColor(entry: CalendarEntry): string {
  if (entry.isCompleted) return "bg-green-500 text-white";
  if (entry.isMissed) return "bg-red-400 text-white";
  if (entry.isToday && entry.isWorkoutDay) return "ring-2 ring-purple-500 bg-purple-50 text-purple-900 font-bold dark:bg-purple-900/20 dark:text-purple-200";
  if (entry.isToday && entry.isRestDay) return "ring-2 ring-slate-400 bg-slate-50 text-slate-600 font-bold dark:bg-[#2A2436] dark:text-[#C9C4D6]";
  if (entry.isWorkoutDay && entry.isFuture) return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300";
  if (entry.isRestDay) return "bg-slate-100 text-slate-400 dark:bg-[#2A2436] dark:text-[#9E97AF]";
  return "bg-slate-100 text-slate-400 dark:bg-[#2A2436] dark:text-[#9E97AF]";
}

interface WorkoutCalendarProps {
  refreshKey?: number;
}

export function WorkoutCalendar({ refreshKey }: WorkoutCalendarProps) {
  const { token } = useAuth();
  const [month, setMonth] = useState(currentMonth);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    dailyWorkoutService
      .getCalendar(month, token)
      .then((data) => setEntries(data.entries))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [token, month, refreshKey]);

  const firstEntry = entries[0];
  const leadingBlanks = firstEntry ? firstEntry.dayNumber - 1 : 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(prevMonth)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-[#9E97AF] dark:hover:bg-[#2A2436]"
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h3 className="text-sm font-extrabold text-slate-900 dark:text-[#F8F7FB]">
          {getMonthLabel(month)}
        </h3>

        <button
          type="button"
          onClick={() => setMonth(nextMonth)}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-[#9E97AF] dark:hover:bg-[#2A2436]"
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_LABELS.map((lbl) => (
          <div
            key={lbl}
            className="text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-[#9E97AF]"
          >
            {lbl}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {entries.map((entry) => {
            const dayNum = Number(entry.date.split("-")[2]);
            return (
              <div
                key={entry.date}
                title={entry.date}
                className={`flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold transition ${entryColor(entry)}`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-[#9E97AF]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-green-500" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-400" /> Missed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-purple-100 dark:bg-purple-900/30" /> Scheduled
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-slate-100 dark:bg-[#2A2436]" /> Rest
        </span>
      </div>
    </div>
  );
}
