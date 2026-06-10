// Routes matching ENDPOINTS.coach in the client:
//   GET  /api/coach/dashboard
//   GET  /api/coach/trainees
//   GET  /api/coach/trainees/:traineeId
//   GET  /api/coach/plans
//   GET  /api/coach/plans/:planId
//   POST /api/coach/plans/:planId/approve
//   POST /api/coach/plans/:planId/reject

import { Router, Response, NextFunction } from "express";
import User from "../models/user.model";
import Plan from "../models/plan.model";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

// Guard: coaches only
function requireCoach(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.authUser?.role !== "coach") {
    res.status(403).json({ message: "Coach access only" });
    return;
  }
  next();
}

router.use(authenticateToken);
router.use(requireCoach);

// ─── GET /api/coach/dashboard ─────────────────────────────────────────────────

router.get("/dashboard", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coach = await User.findById(req.authUser!.userId, { password: 0 });
    if (!coach) { res.status(404).json({ message: "Coach not found" }); return; }

    // Trainees store a reference to their coach via coachId
    const trainees = await User.find(
      { coachId: req.authUser!.userId, role: "trainee" },
      { password: 0 }
    );

    const pendingPlans = await Plan.find({
      coachId: req.authUser!.userId,
      status:  "pending_approval",
    });

    res.status(200).json({ coach, trainees, pendingPlans });
  } catch (error) {
    console.error("Coach dashboard error:", error);
    res.status(500).json({ message: "Failed to get dashboard" });
  }
});

// ─── GET /api/coach/trainees ──────────────────────────────────────────────────

router.get("/trainees", async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Trainees store a reference to their coach via coachId
    const trainees = await User.find(
      { coachId: req.authUser!.userId, role: "trainee" },
      { password: 0 }
    );

    res.status(200).json(trainees);
  } catch (error) {
    console.error("Get trainees error:", error);
    res.status(500).json({ message: "Failed to get trainees" });
  }
});

// ─── GET /api/coach/trainees/:traineeId ───────────────────────────────────────

router.get("/trainees/:traineeId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trainee = await User.findOne(
      { _id: req.params.traineeId, role: "trainee" },
      { password: 0 }
    );
    if (!trainee) { res.status(404).json({ message: "Trainee not found" }); return; }

    const plans = await Plan.find({ traineeId: req.params.traineeId });

    res.status(200).json({ trainee, plans });
  } catch (error) {
    console.error("Get trainee details error:", error);
    res.status(500).json({ message: "Failed to get trainee details" });
  }
});

// ─── GET /api/coach/plans ─────────────────────────────────────────────────────

router.get("/plans", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await Plan.find({ coachId: req.authUser!.userId });
    res.status(200).json(plans);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ message: "Failed to get plans" });
  }
});

// ─── GET /api/coach/plans/:planId ─────────────────────────────────────────────

router.get("/plans/:planId", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plan = await Plan.findOne({
      _id:     req.params.planId,
      coachId: req.authUser!.userId,
    });
    if (!plan) { res.status(404).json({ message: "Plan not found" }); return; }

    res.status(200).json(plan);
  } catch (error) {
    console.error("Get plan error:", error);
    res.status(500).json({ message: "Failed to get plan" });
  }
});

// ─── POST /api/coach/plans/:planId/approve ────────────────────────────────────

router.post("/plans/:planId/approve", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.planId, coachId: req.authUser!.userId },
      { status: "approved" },
      { new: true }
    );
    if (!plan) { res.status(404).json({ message: "Plan not found" }); return; }

    res.status(200).json(plan);
  } catch (error) {
    console.error("Approve plan error:", error);
    res.status(500).json({ message: "Failed to approve plan" });
  }
});

// ─── POST /api/coach/plans/:planId/reject ─────────────────────────────────────

router.post("/plans/:planId/reject", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.planId, coachId: req.authUser!.userId },
      { status: "rejected" },
      { new: true }
    );
    if (!plan) { res.status(404).json({ message: "Plan not found" }); return; }

    res.status(200).json(plan);
  } catch (error) {
    console.error("Reject plan error:", error);
    res.status(500).json({ message: "Failed to reject plan" });
  }
});

export default router;