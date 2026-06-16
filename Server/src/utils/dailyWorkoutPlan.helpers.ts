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
