import { Router, Response } from "express";
import { z } from "zod";
import GeneratedWorkoutPlan from "../models/generatedWorkoutPlan.model";
import type {
  IGeneratedWorkoutPlan,
  IGeneratedWorkoutDay,
} from "../models/generatedWorkoutPlan.model";
import DailyWorkoutLog from "../models/dailyWorkoutLog.model";
import type { IDailyWorkoutLog } from "../models/dailyWorkoutLog.model";
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
} from "../utils/dailyWorkoutPlan.helpers";

const router = Router();
router.use(authenticateToken);

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

router.get("/history", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUser!.userId;
    const todayStr = todayUTC();

    const activePlan = await findActivePlan(userId);

    const allLogs = (await DailyWorkoutLog.find({
      userId,
    }).sort({ workoutDate: -1 })) as unknown as IDailyWorkoutLog[];

    const completedMap = new Map(allLogs.map((l) => [l.workoutDate, l]));

    const entries: {
      date: string;
      dayTitle: string;
      isRestDay: boolean;
      status: "completed" | "missed";
      completedAt: Date | null;
      durationMinutes: number;
      exerciseSummary: string;
      planTitle: string;
    }[] = [];

    if (activePlan) {
      const planStart = toDateString(
        (activePlan as unknown as { createdAt: Date }).createdAt
      );
      const sixtyDaysAgo = offsetDate(todayStr, -60);
      const historyStart = planStart > sixtyDaysAgo ? planStart : sixtyDaysAgo;
      const yesterday = offsetDate(todayStr, -1);

      if (yesterday >= historyStart) {
        const cursor = new Date(yesterday + "T00:00:00Z");
        const start = new Date(historyStart + "T00:00:00Z");

        while (cursor >= start) {
          const dateStr = toDateString(cursor);
          const planDay = findPlanDay(activePlan, dateStr);
          const log = completedMap.get(dateStr);

          if (log) {
            entries.push({
              date: dateStr,
              dayTitle: log.dayTitle,
              isRestDay: log.restDay,
              status: "completed",
              completedAt: log.completedAt,
              durationMinutes: log.durationMinutes,
              exerciseSummary: log.exerciseSummary,
              planTitle: log.planTitle,
            });
            completedMap.delete(dateStr);
          } else if (planDay && !planDay.restDay) {
            entries.push({
              date: dateStr,
              dayTitle: planDay.title,
              isRestDay: false,
              status: "missed",
              completedAt: null,
              durationMinutes: planDay.durationMinutes,
              exerciseSummary: planDay.exercises
                .slice(0, 3)
                .map((e) => e.name)
                .join(", "),
              planTitle: activePlan.title,
            });
          }

          cursor.setUTCDate(cursor.getUTCDate() - 1);
        }
      }
    }

    // Remaining completions from old plans or outside the history window
    for (const log of completedMap.values()) {
      if (log.workoutDate < todayStr) {
        entries.push({
          date: log.workoutDate,
          dayTitle: log.dayTitle,
          isRestDay: log.restDay,
          status: "completed",
          completedAt: log.completedAt,
          durationMinutes: log.durationMinutes,
          exerciseSummary: log.exerciseSummary,
          planTitle: log.planTitle,
        });
      }
    }

    entries.sort((a, b) => b.date.localeCompare(a.date));

    res.json(entries);
  } catch (error) {
    console.error("[DAILY] History error:", error);
    res.status(500).json({ message: "Failed to load workout history" });
  }
});

export default router;
