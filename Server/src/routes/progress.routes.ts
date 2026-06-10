// Routes matching ENDPOINTS.progress in the client:
//   GET /api/progress/dashboard
//   GET /api/progress/history

import { Router, Response } from "express";
import Workout from "../models/workout.model";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

// ─── GET /api/progress/dashboard ─────────────────────────────────────────────
// Returns ProgressSummary shape from progress.models.ts
// Stats are computed live from the Workouts collection.

router.get("/dashboard", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const completedWorkouts = await Workout.find({
      userId: req.authUser!.userId,
      status: "completed",
    }).sort({ scheduledAt: 1 });

    const totalWorkouts = completedWorkouts.length;
    const totalMinutes  = completedWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);

    // Calculate current streak: count consecutive days ending today with a completed workout
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const workoutDays = new Set(
      completedWorkouts.map((w) => {
        const d = new Date(w.scheduledAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    const DAY_MS = 86_400_000;
    let cursor = today.getTime();
    while (workoutDays.has(cursor)) {
      currentStreak++;
      cursor -= DAY_MS;
    }

    res.status(200).json({
      userId:        req.authUser!.userId,
      period:        "all_time",
      totalWorkouts,
      totalMinutes,
      currentStreak,
      longestStreak: currentStreak, // Extend later to track this separately
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
    const workouts = await Workout.find({
      userId: req.authUser!.userId,
      status: "completed",
    }).sort({ scheduledAt: -1 });

    const history = workouts.map((w) => ({
      id:              w._id.toString(),
      date:            w.scheduledAt.toISOString(),
      durationMinutes: w.durationMinutes,
      challengeTitle:  w.title,
    }));

    res.status(200).json(history);
  } catch (error) {
    console.error("Progress history error:", error);
    res.status(500).json({ message: "Failed to get progress history" });
  }
});

export default router;