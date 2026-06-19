import { useState, useEffect } from "react";
import { useAuth } from "../../../app/AuthContext";
import { useDailyWorkout } from "../../workoutManagement/DailyWorkout/useDailyWorkout";
import { progressService } from "../progressService";
import { dailyWorkoutService } from "../../workoutManagement/DailyWorkout/dailyWorkoutService";
import type { ProgressSummary } from "../progress.models";
import type { CalendarEntry } from "../../workoutManagement/DailyWorkout/dailyWorkout.models";

function getCurrentMonthString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getCurrentWeekEntries(entries: CalendarEntry[]): CalendarEntry[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // ISO week starts Mon

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  return weekDates.map(
    (date) => entries.find((e) => e.date === date) ?? {
      date,
      dayNumber: 0,
      isRestDay: true,
      isWorkoutDay: false,
      isToday: false,
      isPast: true,
      isFuture: false,
      isCompleted: false,
      isMissed: false,
    }
  );
}

export interface ProgressDashboardData {
  summary: ProgressSummary | null;
  weekEntries: CalendarEntry[];
  isSummaryLoading: boolean;
  isCalendarLoading: boolean;
  summaryError: string | null;
}

export function useProgressDashboardData(): ProgressDashboardData {
  const { token } = useAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [allEntries, setAllEntries] = useState<CalendarEntry[]>([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsSummaryLoading(false);
      setIsCalendarLoading(false);
      return;
    }

    setIsSummaryLoading(true);
    progressService
      .getProgressDashboard(token)
      .then((data) => setSummary(data))
      .catch(() => setSummaryError("Failed to load progress data."))
      .finally(() => setIsSummaryLoading(false));

    setIsCalendarLoading(true);
    dailyWorkoutService
      .getCalendar(getCurrentMonthString(), token)
      .then((data) => setAllEntries(data.entries))
      .catch(() => {
        /* non-fatal — weekly strip shows empty state */
      })
      .finally(() => setIsCalendarLoading(false));
  }, [token]);

  return {
    summary,
    weekEntries: getCurrentWeekEntries(allEntries),
    isSummaryLoading,
    isCalendarLoading,
    summaryError,
  };
}

export { useDailyWorkout };
