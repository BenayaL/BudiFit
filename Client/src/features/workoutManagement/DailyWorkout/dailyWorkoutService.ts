import { httpClient } from "../../../api/httpClient";
import { ENDPOINTS } from "../../../api/endpoints";
import type {
  DailyDashboard,
  CalendarData,
  WorkoutHistoryEntry,
  DailyWorkoutDayDetails,
} from "./dailyWorkout.models";

function getLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const dailyWorkoutService = {
  getDashboard(token: string): Promise<DailyDashboard> {
    const localDate = getLocalDateString();
    return httpClient.get<DailyDashboard>(
      `${ENDPOINTS.dailyWorkouts.dashboard}?localDate=${localDate}`,
      token
    );
  },

  completeWorkout(
    planId: string,
    workoutDate: string,
    token: string
  ): Promise<{ id: string; completedAt: string }> {
    return httpClient.post<{ id: string; completedAt: string }>(
      ENDPOINTS.dailyWorkouts.complete,
      { planId, workoutDate },
      token
    );
  },

  getCalendar(month: string, token: string): Promise<CalendarData> {
    return httpClient.get<CalendarData>(
      `${ENDPOINTS.dailyWorkouts.calendar}?month=${month}`,
      token
    );
  },

  getDay(date: string, token: string): Promise<DailyWorkoutDayDetails> {
    return httpClient.get<DailyWorkoutDayDetails>(
      ENDPOINTS.dailyWorkouts.day(date),
      token
    );
  },

  getHistory(token: string): Promise<WorkoutHistoryEntry[]> {
    const localDate = getLocalDateString();
    return httpClient.get<WorkoutHistoryEntry[]>(
      ENDPOINTS.dailyWorkouts.history(localDate),
      token
    );
  },
};
