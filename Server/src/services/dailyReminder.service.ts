import User from "../models/user.model";
import GeneratedWorkoutPlan from "../models/generatedWorkoutPlan.model";
import DailyWorkoutLog from "../models/dailyWorkoutLog.model";
import { createNotification } from "../helpers/notification.helper";
import { toDateString, findPlanDay } from "../utils/dailyWorkoutPlan.helpers";

// ─── Single-user ──────────────────────────────────────────────────────────────

export async function createDailyWorkoutReminderForUser(
  userId: string
): Promise<{ created: number; skipped: number; reason?: string }> {
  try {
    const user = await User.findById(userId, {
      role: 1,
      "settings.notifications.dailyWorkoutReminder": 1,
    });

    if (!user) return { created: 0, skipped: 1, reason: "user_not_found" };
    if (user.role !== "trainee") return { created: 0, skipped: 1, reason: "not_trainee" };
    if (user.settings?.notifications?.dailyWorkoutReminder === false)
      return { created: 0, skipped: 1, reason: "reminder_disabled" };

    // UTC date string — consistent with workoutDate stored in DailyWorkoutLog.
    const todayStr = toDateString(new Date());

    const plan = await GeneratedWorkoutPlan.findOne({
      userId,
      status: "active",
      approvalStatus: { $in: ["approved", "not_required"] },
    });

    if (!plan) return { created: 0, skipped: 1, reason: "no_active_plan" };

    const todayDay = findPlanDay(plan, todayStr);
    if (!todayDay || todayDay.restDay)
      return { created: 0, skipped: 1, reason: "rest_day" };

    const alreadyCompleted = await DailyWorkoutLog.exists({
      userId,
      workoutDate: todayStr,
      status: "completed",
    });

    if (alreadyCompleted) return { created: 0, skipped: 1, reason: "already_completed" };

    const wasCreated = await createNotification({
      recipientId: userId,
      type: "today_workout_ready",
      title: "Today's workout is ready",
      message:
        "You have a workout scheduled for today. Complete it to keep your streak going.",
      actionUrl: "workout",
      category: "workout_reminder",
      priority: "normal",
      dedupeKey: `today_workout_ready:${userId}:${todayStr}`,
    });

    return wasCreated
      ? { created: 1, skipped: 0 }
      : { created: 0, skipped: 1, reason: "deduped" };
  } catch (error) {
    console.error("[REMINDER] createDailyWorkoutReminderForUser failed:", error);
    return { created: 0, skipped: 1, reason: "error" };
  }
}

// ─── All trainees (cron) ──────────────────────────────────────────────────────

export async function createDailyWorkoutRemindersForAllUsers(): Promise<{
  created: number;
  skipped: number;
}> {
  const trainees = await User.find({ role: "trainee" }, { _id: 1 });

  let created = 0;
  let skipped = 0;

  for (const trainee of trainees) {
    const result = await createDailyWorkoutReminderForUser(
      trainee._id.toString()
    );
    created += result.created;
    skipped += result.skipped;
  }

  return { created, skipped };
}
