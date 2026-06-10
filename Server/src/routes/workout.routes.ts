// Routes matching ENDPOINTS.workouts in the client:
//   GET  /api/workouts
//   GET  /api/workouts/:workoutId
//   POST /api/workouts/:workoutId/complete

import { Router, Response } from "express";
import Workout from "../models/workout.model";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

// ─── GET /api/workouts ────────────────────────────────────────────────────────

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workouts = await Workout.find({ userId: req.authUser!.userId })
      .sort({ scheduledAt: -1 });

    res.status(200).json(workouts);
  } catch (error) {
    console.error("List workouts error:", error);
    res.status(500).json({ message: "Failed to get workouts" });
  }
});

// ─── GET /api/workouts/:workoutId ─────────────────────────────────────────────

router.get("/:workoutId", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workout = await Workout.findOne({
      _id:    req.params.workoutId,
      userId: req.authUser!.userId,
    });

    if (!workout) {
      res.status(404).json({ message: "Workout not found" });
      return;
    }

    res.status(200).json(workout);
  } catch (error) {
    console.error("Get workout error:", error);
    res.status(500).json({ message: "Failed to get workout" });
  }
});

// ─── POST /api/workouts/:workoutId/complete ───────────────────────────────────
// Stats (totalWorkouts, streak, etc.) are computed live in progress.routes.ts
// so no user document update is needed here.

router.post("/:workoutId/complete", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.workoutId, userId: req.authUser!.userId },
      { status: "completed" },
      { new: true }
    );

    if (!workout) {
      res.status(404).json({ message: "Workout not found" });
      return;
    }

    res.status(200).json(workout);
  } catch (error) {
    console.error("Complete workout error:", error);
    res.status(500).json({ message: "Failed to complete workout" });
  }
});

export default router;