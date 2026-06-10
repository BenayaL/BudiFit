// Routes matching ENDPOINTS.export in the client:
//   GET /api/export/workout-summary/pdf
//   GET /api/export/workout-summary/email
//
// NOTE: Real PDF generation and email sending are external integrations
// (e.g. pdfkit + nodemailer). These stubs return the correct shape so the
// frontend doesn't error — replace the TODO sections when you're ready.

import { Router, Response } from "express";
import Workout from "../models/workout.model";
import User from "../models/user.model";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";

const router = Router();

// ─── GET /api/export/workout-summary/pdf ─────────────────────────────────────

router.get("/workout-summary/pdf", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.authUser!.userId, { password: 0 });
    const workouts = await Workout.find({
      userId: req.authUser!.userId,
      status: "completed",
    }).sort({ scheduledAt: -1 });

    // TODO: generate a real PDF with a library like pdfkit
    // For now we return a plain JSON summary so the client call succeeds
    res.status(200).json({
      message: "PDF export not yet implemented",
      summary: {
        user:          user?.firstName + " " + user?.lastName,
        totalWorkouts: workouts.length,
        workouts:      workouts.map((w) => ({
          title: w.title,
          date:  w.scheduledAt,
          durationMinutes: w.durationMinutes,
        })),
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    res.status(500).json({ message: "Failed to export PDF" });
  }
});

// ─── GET /api/export/workout-summary/email ────────────────────────────────────

router.get("/workout-summary/email", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.authUser!.userId, { password: 0 });
    if (!user) { res.status(404).json({ message: "User not found" }); return; }

    // TODO: send a real email with nodemailer
    console.log(`Email export requested for ${user.email}`);

    res.status(200).json({
      message: `Email export not yet implemented (would send to ${user.email})`,
    });
  } catch (error) {
    console.error("Email export error:", error);
    res.status(500).json({ message: "Failed to send export email" });
  }
});

export default router;