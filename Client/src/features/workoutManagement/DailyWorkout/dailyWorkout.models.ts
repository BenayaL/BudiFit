export interface DailyExercise {
  id?: string;
  order: number;
  name: string;
  sets?: number;
  reps?: string;
  durationSec?: number;
  restSec?: number;
  equipment: string;
  notes?: string;
}

export interface DailyPlanDay {
  dayNumber: number;
  title: string;
  restDay: boolean;
  durationMinutes: number;
  exercises: DailyExercise[];
}

export interface DailyActivePlan {
  id: string;
  title: string;
  workoutDaysPerWeek: number;
  durationWeeks: number;
  approvalStatus: "not_required" | "pending_review" | "approved";
}

export interface DailyCompletion {
  id: string;
  completedAt: string;
}

export interface DailyDayInfo {
  date: string; // "YYYY-MM-DD"
  dayNumber: number;
  planDay: DailyPlanDay | null;
  completion: DailyCompletion | null;
}

export interface DailyDashboard {
  activePlan: DailyActivePlan | null;
  today: DailyDayInfo;
  tomorrow: DailyDayInfo;
  streak: number;
}

export interface CalendarEntry {
  date: string;
  dayNumber: number;
  isRestDay: boolean;
  isWorkoutDay: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isCompleted: boolean;
  isMissed: boolean;
}

export interface CalendarData {
  activePlanId: string | null;
  month: string; // "YYYY-MM"
  entries: CalendarEntry[];
}

export interface WorkoutHistoryEntry {
  planId: string;
  planTitle: string;
  planStatus: string;
  archiveReason?: string;
  date: string;
  dayNumber: number;
  dayTitle: string;
  status: "completed" | "missed";
  completedAt: string | null;
  durationMinutes: number;
  exerciseSummary: string;
}
