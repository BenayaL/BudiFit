// Routes matching ENDPOINTS.progress in the client:
//   GET /api/progress/dashboard
//   GET /api/progress/history

import { Router, Response } from "express";
import DailyWorkoutLog from "../models/dailyWorkoutLog.model";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

// Returns today's date as a YYYY-MM-DD string in server-local time.
function todayLocalString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Subtract one calendar day from a YYYY-MM-DD string.
// Using noon avoids any DST-related edge cases.
function subtractDay(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

// Add one calendar day to a YYYY-MM-DD string.
function addDay(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

// ─── GET /api/progress/dashboard ─────────────────────────────────────────────
// All DailyWorkoutLog documents have status "completed" (schema enforces it).

router.get("/dashboard", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await DailyWorkoutLog.find({
      userId: req.authUser!.userId,
      status: "completed",
    });

    const totalWorkouts = logs.length;
    const totalMinutes = logs.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);

    // Distinct workout dates sorted ascending; one streak day per calendar date
    // regardless of how many logs exist for that date (e.g. multiple plans).
    const distinctDates = [...new Set(logs.map((l) => l.workoutDate))].sort();
    const dateSet = new Set(distinctDates);

    // currentStreak: consecutive days ending today; if today is absent, end yesterday.
    const todayStr = todayLocalString();
    const yesterdayStr = subtractDay(todayStr);

    let currentStreak = 0;
    let cursor: string | null = dateSet.has(todayStr)
      ? todayStr
      : dateSet.has(yesterdayStr)
      ? yesterdayStr
      : null;

    while (cursor !== null && dateSet.has(cursor)) {
      currentStreak++;
      cursor = subtractDay(cursor);
    }

    // longestStreak: longest consecutive run in all-time history.
    let longestStreak = distinctDates.length > 0 ? 1 : 0;
    let run = longestStreak;
    for (let i = 1; i < distinctDates.length; i++) {
      run = addDay(distinctDates[i - 1]) === distinctDates[i] ? run + 1 : 1;
      if (run > longestStreak) longestStreak = run;
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    res.status(200).json({
      userId:        req.authUser!.userId,
      period:        "all_time",
      totalWorkouts,
      totalMinutes,
      currentStreak,
      longestStreak,
    });
  } catch (error) {
    console.error("Progress dashboard error:", error);
    res.status(500).json({ message: "Failed to get progress dashboard" });
  }
});

// ─── GET /api/progress/history ────────────────────────────────────────────────
// Returns WorkoutHistoryItem[] shape from progress.models.ts

router.get("/history", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await DailyWorkoutLog.find({
      userId: req.authUser!.userId,
      status: "completed",
    }).sort({ completedAt: -1 });

    const history = logs.map((l) => ({
      id:              l._id.toString(),
      date:            l.completedAt.toISOString(),
      durationMinutes: l.durationMinutes,
      challengeTitle:
        l.planTitle && l.dayTitle
          ? `${l.planTitle} — ${l.dayTitle}`
          : l.dayTitle || "Workout",
    }));

    res.status(200).json(history);
  } catch (error) {
    console.error("Progress history error:", error);
    res.status(500).json({ message: "Failed to get progress history" });
  }
});

export default router;
