import { Router, Response } from "express";
import { z } from "zod";
import GeneratedWorkoutPlan from "../models/generatedWorkoutPlan.model";
import type {
  IGeneratedWorkoutPlan,
  IGeneratedWorkoutDay,
} from "../models/generatedWorkoutPlan.model";
import DailyWorkoutLog from "../models/dailyWorkoutLog.model";
import type { IDailyWorkoutLog } from "../models/dailyWorkoutLog.model";
import User from "../models/user.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";
import {
  toDateString,
  offsetDate,
  getDayNumber,
  findPlanDay,
  getPlanWindow,
  calculateStreak,
  getHistoricalEndDate,
  isValidLocalDate,
} from "../utils/dailyWorkoutPlan.helpers";
import { createNotification } from "../helpers/notification.helper";

const router = Router();
router.use(authenticateToken);

// ─── AI-only notification helpers ────────────────────────────────────────────

async function triggerDashboardNotifications(
  userId: string,
  todayStr: string,
  plan: IGeneratedWorkoutPlan | null,
  completedSet: Set<string>
): Promise<void> {
  try {
    const user = await User.findById(userId, { coachId: 1, "settings.notifications": 1 });
    if (!user || user.coachId) return;

    const prefs = user.settings?.notifications;
    const reminderOn = prefs?.dailyWorkoutReminder !== false;
    const challengesOn = prefs?.challengeUpdates !== false;

    if (!plan) {
      if (challengesOn) {
        await createNotification({
          recipientId: userId,
          type: "no_active_plan",
          message: "You don't have an active workout plan right now. Budi can create one for you.",
          title: "Ready for a new plan?",
          actionUrl: "workout",
          category: "system",
          priority: "normal",
          dedupeKey: `no_active_plan:${userId}:${todayStr}`,
        });
      }
      return;
    }

    if (reminderOn) {
      const todayDay = findPlanDay(plan, todayStr);
      if (todayDay && !todayDay.restDay && !completedSet.has(todayStr)) {
        await createNotification({
          recipientId: userId,
          type: "today_workout_ready",
          message: "You have a workout scheduled for today.",
          title: "Today's workout is ready",
          actionUrl: "workout",
          category: "workout_reminder",
          priority: "normal",
          dedupeKey: `today_workout_ready:${userId}:${todayStr}`,
        });
      }

      const yesterdayStr = offsetDate(todayStr, -1);
      const yesterdayDay = findPlanDay(plan, yesterdayStr);
      if (yesterdayDay && !yesterdayDay.restDay && !completedSet.has(yesterdayStr)) {
        await createNotification({
          recipientId: userId,
          type: "missed_workout",
          message: "You missed yesterday's workout. No worries — let's get back on track today.",
          title: "Workout missed",
          actionUrl: "workout",
          category: "workout_reminder",
          priority: "normal",
          dedupeKey: `missed_workout:${userId}:${yesterdayStr}`,
        });
      }
    }
  } catch (err) {
    console.error("[DAILY] Dashboard notification trigger failed:", err);
  }
}

async function triggerCompletionNotifications(
  userId: string,
  planId: string,
  workoutDate: string
): Promise<void> {
  try {
    const user = await User.findById(userId, { coachId: 1, "settings.notifications.challengeUpdates": 1 });
    if (!user || user.coachId) return;
    if (user.settings?.notifications?.challengeUpdates === false) return;

    await createNotification({
      recipientId: userId,
      type: "workout_completed",
      message: "Great job completing today's workout.",
      title: "Workout completed",
      actionUrl: "dashboard",
      category: "progress",
      priority: "low",
      dedupeKey: `workout_completed:${userId}:${workoutDate}`,
    });

    const plan = await GeneratedWorkoutPlan.findById(planId);
    if (!plan) return;

    const allLogs = await DailyWorkoutLog.find({ userId, planId }) as unknown as IDailyWorkoutLog[];
    const completedSet = new Set(allLogs.map((l) => l.workoutDate));
    const streak = calculateStreak(completedSet, plan as unknown as IGeneratedWorkoutPlan, toDateString(new Date()));

    const MILESTONES = [3, 7, 14, 30];
    if (MILESTONES.includes(streak)) {
      await createNotification({
        recipientId: userId,
        type: "streak_milestone",
        message: "Great job. You're building real consistency.",
        title: `${streak}-day streak!`,
        actionUrl: "dashboard",
        category: "progress",
        priority: "normal",
        dedupeKey: `streak_milestone:${userId}:${streak}`,
      });
    }
  } catch (err) {
    console.error("[DAILY] Completion notification trigger failed:", err);
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function todayUTC(): string {
  return toDateString(new Date());
}

function dayToDTO(day: IGeneratedWorkoutDay) {
  return {
    dayNumber: day.dayNumber,
    title: day.title,
    restDay: day.restDay,
    durationMinutes: day.durationMinutes,
    exercises: day.exercises.map((ex) => ({
      id: ex._id ? String(ex._id) : undefined,
      order: ex.order,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      durationSec: ex.durationSec,
      restSec: ex.restSec,
      equipment: ex.equipment,
      notes: ex.notes,
    })),
  };
}

/**
 * Find the trainee's current active plan.
 * Uses the same query pattern as the My Plans endpoint:
 *   - userId as a plain string (Mongoose auto-casts to ObjectId)
 *   - status: "active" (excludes draft/pending-review, completed, archived)
 * A plan is "active" for daily workouts when it has been approved by a coach
 * (approvalStatus: "approved") or was generated without a coach
 * (approvalStatus: "not_required"). Both have status: "active".
 */
async function findActivePlan(userId: string): Promise<IGeneratedWorkoutPlan | null> {
  const doc = await GeneratedWorkoutPlan.findOne({
    userId,          // plain string — Mongoose casts to ObjectId (matches My Plans)
    status: "active",
  });
  return doc ? (doc as unknown as IGeneratedWorkoutPlan) : null;
}

// ─── GET /api/daily-workouts/dashboard ───────────────────────────────────────

router.get("/dashboard", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUser!.userId;
    const localDate =
      typeof req.query.localDate === "string"
        ? req.query.localDate
        : todayUTC();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
      res
        .status(400)
        .json({ message: "Invalid localDate. Expected YYYY-MM-DD." });
      return;
    }

    const todayStr = localDate;
    const tomorrowStr = offsetDate(todayStr, 1);

    const plan = await findActivePlan(userId);

    if (!plan) {
      res.json({
        activePlan: null,
        today: {
          date: todayStr,
          dayNumber: getDayNumber(todayStr),
          planDay: null,
          completion: null,
        },
        tomorrow: {
          date: tomorrowStr,
          dayNumber: getDayNumber(tomorrowStr),
          planDay: null,
          completion: null,
        },
        streak: 0,
      });
      void triggerDashboardNotifications(userId, todayStr, null, new Set());
      return;
    }

    const allLogs = (await DailyWorkoutLog.find({
      userId,
      planId: (plan as unknown as { _id: unknown })._id,
    })) as unknown as IDailyWorkoutLog[];

    const todayLog = allLogs.find((l) => l.workoutDate === todayStr) ?? null;
    const todayDay = findPlanDay(plan, todayStr);
    const tomorrowDay = findPlanDay(plan, tomorrowStr);
    const completedSet = new Set(allLogs.map((l) => l.workoutDate));
    const streak = calculateStreak(completedSet, plan, todayStr);

    res.json({
      activePlan: {
        id: String((plan as unknown as { _id: unknown })._id),
        title: plan.title,
        workoutDaysPerWeek: plan.workoutDaysPerWeek,
        durationWeeks: plan.durationWeeks,
        approvalStatus: plan.approvalStatus,
      },
      today: {
        date: todayStr,
        dayNumber: getDayNumber(todayStr),
        planDay: todayDay ? dayToDTO(todayDay) : null,
        completion: todayLog
          ? {
              id: String((todayLog as unknown as { _id: unknown })._id),
              completedAt: todayLog.completedAt,
            }
          : null,
      },
      tomorrow: {
        date: tomorrowStr,
        dayNumber: getDayNumber(tomorrowStr),
        planDay: tomorrowDay ? dayToDTO(tomorrowDay) : null,
        completion: null,
      },
      streak,
    });
    void triggerDashboardNotifications(userId, todayStr, plan, completedSet);
  } catch (error) {
    console.error("[DAILY] Dashboard error:", error);
    res.status(500).json({ message: "Failed to load daily workout dashboard" });
  }
});

// ─── POST /api/daily-workouts/complete ───────────────────────────────────────

const completeBodySchema = z.object({
  planId: z.string().min(1),
  workoutDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

router.post("/complete", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUser!.userId;
    const parsed = completeBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Invalid request body",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { planId, workoutDate } = parsed.data;

    // Reject if date is today or later (allow today + past, not future)
    const tomorrowStr = offsetDate(todayUTC(), 1);
    if (workoutDate >= tomorrowStr) {
      res
        .status(400)
        .json({ message: "Cannot complete a future workout." });
      return;
    }

    const plan = await GeneratedWorkoutPlan.findOne({
      _id: planId,
      userId,
      status: "active",
    });

    if (!plan) {
      res.status(404).json({ message: "Active plan not found" });
      return;
    }

    const planDoc = plan as unknown as IGeneratedWorkoutPlan;
    const planDay = findPlanDay(planDoc, workoutDate);

    if (!planDay || planDay.restDay) {
      res.status(400).json({
        message: "This day is a rest day and cannot be marked as completed.",
      });
      return;
    }

    const exerciseSummary = planDay.exercises
      .slice(0, 5)
      .map((ex) => ex.name)
      .join(", ");

    try {
      const log = await DailyWorkoutLog.create({
        userId,
        planId: (plan as unknown as { _id: unknown })._id,
        workoutDate,
        dayNumber: getDayNumber(workoutDate),
        status: "completed",
        completedAt: new Date(),
        planTitle: planDoc.title,
        dayTitle: planDay.title,
        exerciseSummary,
        durationMinutes: planDay.durationMinutes,
        restDay: false,
      });

      const logDoc = log as unknown as IDailyWorkoutLog & { _id: unknown };

      res.status(201).json({
        id: String(logDoc._id),
        workoutDate: logDoc.workoutDate,
        completedAt: logDoc.completedAt,
        planTitle: logDoc.planTitle,
        dayTitle: logDoc.dayTitle,
      });
      void triggerCompletionNotifications(userId, planId, workoutDate);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: unknown }).code === 11000
      ) {
        res
          .status(409)
          .json({ message: "This workout is already marked as completed." });
        return;
      }
      throw err;
    }
  } catch (error) {
    console.error("[DAILY] Complete error:", error);
    res.status(500).json({ message: "Failed to mark workout as completed" });
  }
});

// ─── GET /api/daily-workouts/calendar ────────────────────────────────────────

router.get("/calendar", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUser!.userId;
    const monthParam =
      typeof req.query.month === "string"
        ? req.query.month
        : todayUTC().slice(0, 7);

    if (!/^\d{4}-\d{2}$/.test(monthParam)) {
      res
        .status(400)
        .json({ message: "Invalid month. Expected YYYY-MM." });
      return;
    }

    const todayStr = todayUTC();

    const plan = await findActivePlan(userId);

    if (!plan) {
      res.json({ activePlanId: null, month: monthParam, entries: [] });
      return;
    }

    const startDate = monthParam + "-01";
    const nextMonthDate = new Date(monthParam + "-01T00:00:00Z");
    nextMonthDate.setUTCMonth(nextMonthDate.getUTCMonth() + 1);
    const endDate = toDateString(nextMonthDate);

    const planId = (plan as unknown as { _id: unknown })._id;
    const { startDate: planStartDate, endDate: planEndDate } = getPlanWindow(plan);

    const logs = (await DailyWorkoutLog.find({
      userId,
      planId,
      workoutDate: { $gte: startDate, $lt: endDate },
    })) as unknown as IDailyWorkoutLog[];

    const completedDates = new Set(logs.map((l) => l.workoutDate));

    const entries: {
      date: string;
      dayNumber: number;
      isRestDay: boolean;
      isWorkoutDay: boolean;
      isToday: boolean;
      isPast: boolean;
      isFuture: boolean;
      isCompleted: boolean;
      isMissed: boolean;
    }[] = [];

    const cursor = new Date(startDate + "T00:00:00Z");
    const end = new Date(endDate + "T00:00:00Z");

    while (cursor < end) {
      const dateStr = toDateString(cursor);
      const planDay = findPlanDay(plan, dateStr);
      const isInPlanWindow = dateStr >= planStartDate && dateStr < planEndDate;
      const isRestDay = !planDay || planDay.restDay;
      // Only mark as a workout day when inside the plan's active window
      const isWorkoutDay = !isRestDay && isInPlanWindow;
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;
      const isCompleted = completedDates.has(dateStr);
      // isMissed: past workout day within plan window that wasn't completed
      const isMissed = isPast && isWorkoutDay && !isCompleted;

      entries.push({
        date: dateStr,
        dayNumber: getDayNumber(dateStr),
        isRestDay,
        isWorkoutDay,
        isToday,
        isPast,
        isFuture,
        isCompleted,
        isMissed,
      });

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    res.json({ activePlanId: String(planId), month: monthParam, entries });
  } catch (error) {
    console.error("[DAILY] Calendar error:", error);
    res.status(500).json({ message: "Failed to load calendar data" });
  }
});

// ─── GET /api/daily-workouts/history ─────────────────────────────────────────

interface DailyHistoryEntry {
  planId: string;
  planTitle: string;
  planStatus: string;
  archiveReason?: string;
  date: string;
  dayNumber: number;
  dayTitle: string;
  status: "completed" | "missed";
  completedAt: Date | null;
  durationMinutes: number;
  exerciseSummary: string;
}

router.get("/history", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUser!.userId;
    const localDateParam = req.query.localDate;
    if (localDateParam !== undefined && !isValidLocalDate(localDateParam)) {
      res.status(400).json({ message: "Invalid localDate. Expected YYYY-MM-DD." });
      return;
    }
    const localDate = isValidLocalDate(localDateParam) ? localDateParam : todayUTC();

    // Derive history from every plan that could have scheduled a workout —
    // active, completed, or archived (removed/replaced/superseded).
    const plans = (await GeneratedWorkoutPlan.find({
      userId,
      status: { $in: ["active", "completed", "archived"] },
    })) as unknown as IGeneratedWorkoutPlan[];

    const allLogs = (await DailyWorkoutLog.find({
      userId,
    })) as unknown as IDailyWorkoutLog[];

    const logsByPlanId = new Map<string, IDailyWorkoutLog[]>();
    for (const log of allLogs) {
      const key = log.planId.toString();
      const arr = logsByPlanId.get(key) ?? [];
      arr.push(log);
      logsByPlanId.set(key, arr);
    }

    const entries: DailyHistoryEntry[] = [];
    const knownPlanIds = new Set<string>();
    const tomorrowLocal = offsetDate(localDate, 1);

    for (const plan of plans) {
      const planId = String((plan as unknown as { _id: unknown })._id);
      knownPlanIds.add(planId);

      const logsByDate = new Map(
        (logsByPlanId.get(planId) ?? []).map((l) => [l.workoutDate, l])
      );

      const { startDate } = getPlanWindow(plan);
      const historicalEnd = getHistoricalEndDate(plan);
      const iterEnd = historicalEnd < tomorrowLocal ? historicalEnd : tomorrowLocal;

      for (let cursor = startDate; cursor < iterEnd; cursor = offsetDate(cursor, 1)) {
        const planDay = findPlanDay(plan, cursor);
        if (!planDay || planDay.restDay) continue;

        const log = logsByDate.get(cursor);
        if (log) {
          entries.push({
            planId,
            planTitle: plan.title,
            planStatus: plan.status,
            archiveReason: plan.archiveReason,
            date: cursor,
            dayNumber: planDay.dayNumber,
            dayTitle: log.dayTitle,
            status: "completed",
            completedAt: log.completedAt,
            durationMinutes: log.durationMinutes,
            exerciseSummary: log.exerciseSummary,
          });
        } else if (cursor < localDate) {
          entries.push({
            planId,
            planTitle: plan.title,
            planStatus: plan.status,
            archiveReason: plan.archiveReason,
            date: cursor,
            dayNumber: planDay.dayNumber,
            dayTitle: planDay.title,
            status: "missed",
            completedAt: null,
            durationMinutes: planDay.durationMinutes,
            exerciseSummary: planDay.exercises.slice(0, 3).map((e) => e.name).join(", "),
          });
        }
      }
    }

    // Orphan logs: their plan was permanently deleted. Only the completion
    // itself survives (via the log's own snapshot fields) — missed days for
    // a deleted plan can never be reconstructed.
    for (const log of allLogs) {
      const planIdStr = log.planId.toString();
      if (knownPlanIds.has(planIdStr)) continue;
      entries.push({
        planId: planIdStr,
        planTitle: log.planTitle,
        planStatus: "deleted",
        date: log.workoutDate,
        dayNumber: log.dayNumber,
        dayTitle: log.dayTitle,
        status: "completed",
        completedAt: log.completedAt,
        durationMinutes: log.durationMinutes,
        exerciseSummary: log.exerciseSummary,
      });
    }

    entries.sort(
      (a, b) => b.date.localeCompare(a.date) || a.planId.localeCompare(b.planId)
    );

    res.json(entries);
  } catch (error) {
    console.error("[DAILY] History error:", error);
    res.status(500).json({ message: "Failed to load workout history" });
  }
});

export default router;
