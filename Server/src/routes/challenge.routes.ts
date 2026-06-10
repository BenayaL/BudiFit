// Routes matching ENDPOINTS.challenges in the client:
//   GET  /api/challenges/today
//   GET  /api/challenges/weekly
//   GET  /api/challenges/history
//   POST /api/challenges/:challengeId/complete

import { Router, Response } from "express";
import Workout from "../models/workout.model";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

function startOfDay(d: Date)  { const x = new Date(d); x.setHours(0, 0, 0, 0);       return x; }
function endOfDay(d: Date)    { const x = new Date(d); x.setHours(23, 59, 59, 999);   return x; }
function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay());
  x.setHours(0, 0, 0, 0);
  return x;
}

// ─── GET /api/challenges/today ────────────────────────────────────────────────

router.get("/today", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const challenges = await Workout.find({
      userId:      req.authUser!.userId,
      scheduledAt: { $gte: startOfDay(now), $lte: endOfDay(now) },
    });
    res.status(200).json(challenges);
  } catch (error) {
    console.error("Get today challenges error:", error);
    res.status(500).json({ message: "Failed to get today's challenges" });
  }
});

// ─── GET /api/challenges/weekly ───────────────────────────────────────────────

router.get("/weekly", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const challenges = await Workout.find({
      userId:      req.authUser!.userId,
      scheduledAt: { $gte: startOfWeek(now) },
    });
    res.status(200).json(challenges);
  } catch (error) {
    console.error("Get weekly challenges error:", error);
    res.status(500).json({ message: "Failed to get weekly challenges" });
  }
});

// ─── GET /api/challenges/history ──────────────────────────────────────────────

router.get("/history", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const challenges = await Workout.find({
      userId: req.authUser!.userId,
      status: "completed",
    }).sort({ scheduledAt: -1 });
    res.status(200).json(challenges);
  } catch (error) {
    console.error("Get challenges history error:", error);
    res.status(500).json({ message: "Failed to get challenge history" });
  }
});

// ─── POST /api/challenges/:challengeId/complete ───────────────────────────────

router.post("/:challengeId/complete", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const challenge = await Workout.findOneAndUpdate(
      { _id: req.params.challengeId, userId: req.authUser!.userId },
      { status: "completed" },
      { new: true }
    );

    if (!challenge) {
      res.status(404).json({ message: "Challenge not found" });
      return;
    }

    res.status(200).json(challenge);
  } catch (error) {
    console.error("Complete challenge error:", error);
    res.status(500).json({ message: "Failed to complete challenge" });
  }
});

export default router;