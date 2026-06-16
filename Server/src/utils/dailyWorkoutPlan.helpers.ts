import type {
  IGeneratedWorkoutPlan,
  IGeneratedWorkoutDay,
} from "../models/generatedWorkoutPlan.model";

const DAY_MS = 86_400_000;

export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function offsetDate(dateStr: string, offsetDays: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return toDateString(d);
}

/** Maps YYYY-MM-DD → dayNumber 1=Mon … 7=Sun */
export function getDayNumber(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00Z");
  return ((d.getUTCDay() + 6) % 7) + 1;
}

export function findPlanDay(
  plan: IGeneratedWorkoutPlan,
  dateStr: string
): IGeneratedWorkoutDay | null {
  const dayNum = getDayNumber(dateStr);
  return plan.days.find((d) => d.dayNumber === dayNum) ?? null;
}

/**
 * A plan's active window as a half-open [startDate, endDate) range.
 * Start = reviewedAt for coach-approved plans, otherwise createdAt.
 * End = start + durationWeeks * 7 days.
 */
export function getPlanWindow(
  plan: Pick<
    IGeneratedWorkoutPlan,
    "createdAt" | "reviewedAt" | "approvalStatus" | "durationWeeks"
  >
): { startDate: string; endDate: string } {
  const startDate = toDateString(
    plan.approvalStatus === "approved" && plan.reviewedAt
      ? plan.reviewedAt
      : plan.createdAt
  );
  const endMs =
    new Date(startDate + "T00:00:00Z").getTime() +
    plan.durationWeeks * 7 * DAY_MS;
  const endDate = toDateString(new Date(endMs));
  return { startDate, endDate };
}

/**
 * Streak of consecutive completed scheduled workout days, walking
 * backward from yesterday. Rest days (and days with no plan entry)
 * are skipped without breaking the streak. Includes today if today's
 * scheduled workout was already completed.
 */
export function calculateStreak(
  completedDates: Set<string>,
  plan: IGeneratedWorkoutPlan,
  todayStr: string
): number {
  let streak = 0;
  let cursorMs = new Date(todayStr + "T00:00:00Z").getTime() - DAY_MS;

  for (let i = 0; i < 400; i++) {
    const dateStr = toDateString(new Date(cursorMs));
    const planDay = findPlanDay(plan, dateStr);

    if (!planDay || planDay.restDay) {
      cursorMs -= DAY_MS;
      continue;
    }

    if (completedDates.has(dateStr)) {
      streak++;
      cursorMs -= DAY_MS;
    } else {
      break;
    }
  }

  const todayDay = findPlanDay(plan, todayStr);
  if (todayDay && !todayDay.restDay && completedDates.has(todayStr)) {
    streak++;
  }

  return streak;
}

export function isValidLocalDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * The actual date a plan's history stopped accruing scheduled workouts:
 * completedAt for completed plans, archivedAt for archived plans, otherwise
 * the plan's natural end (start + durationWeeks * 7 days). Whichever of
 * these is earliest still bounds the natural end.
 */
export function getHistoricalEndDate(
  plan: Pick<
    IGeneratedWorkoutPlan,
    | "status"
    | "completedAt"
    | "archivedAt"
    | "createdAt"
    | "reviewedAt"
    | "approvalStatus"
    | "durationWeeks"
  >
): string {
  const { endDate: naturalEnd } = getPlanWindow(plan);

  if (plan.status === "completed" && plan.completedAt) {
    const completedDate = toDateString(plan.completedAt);
    return completedDate < naturalEnd ? completedDate : naturalEnd;
  }

  if (plan.status === "archived" && plan.archivedAt) {
    const archivedDate = toDateString(plan.archivedAt);
    return archivedDate < naturalEnd ? archivedDate : naturalEnd;
  }

  return naturalEnd;
}

export interface PlanScheduleStats {
  scheduledWorkouts: number;
  completedWorkouts: number;
  missedWorkouts: number;
  completionRate: number;
}

/**
 * Scheduled/completed/missed counts for a plan within its actual lifecycle
 * window, never counting dates after `localDate` or after `historicalEnd`
 * (defaults to the plan's natural end when omitted — i.e. for the active
 * plan). `completedDates` must already be scoped to this plan's logs.
 */
export function computePlanScheduleStats(
  plan: IGeneratedWorkoutPlan,
  completedDates: Set<string>,
  localDate: string,
  historicalEnd?: string
): PlanScheduleStats {
  const { startDate, endDate: naturalEnd } = getPlanWindow(plan);
  const cappedEnd = historicalEnd ?? naturalEnd;
  const tomorrowLocal = offsetDate(localDate, 1);
  const iterEnd = cappedEnd < tomorrowLocal ? cappedEnd : tomorrowLocal;

  let scheduledWorkouts = 0;
  let completedWorkouts = 0;
  let missedWorkouts = 0;

  for (let cursor = startDate; cursor < iterEnd; cursor = offsetDate(cursor, 1)) {
    const planDay = findPlanDay(plan, cursor);
    if (!planDay || planDay.restDay) continue;

    scheduledWorkouts++;
    if (completedDates.has(cursor)) {
      completedWorkouts++;
    } else if (cursor < localDate) {
      missedWorkouts++;
    }
  }

  const completionRate =
    scheduledWorkouts > 0
      ? Math.round((completedWorkouts / scheduledWorkouts) * 100)
      : 0;

  return { scheduledWorkouts, completedWorkouts, missedWorkouts, completionRate };
}

/** Human label for a historical (completed/archived) plan card badge. */
export function getHistoryLabel(status: string, archiveReason?: string): string {
  if (status === "completed") return "Completed";
  if (status !== "archived") return "Archived";

  switch (archiveReason) {
    case "removed_by_trainee":
      return "Removed";
    case "replaced":
    case "replaced_not_suitable":
      return "Replaced";
    case "removed_by_coach":
      return "Removed by coach";
    case "superseded_by_new_plan":
      return "Replaced by new plan";
    default:
      return "Archived";
  }
}
