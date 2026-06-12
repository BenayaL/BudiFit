// Routes matching ENDPOINTS.export in the client:
//   GET /api/export/workout-summary/pdf    → streams a PDF file for download
//   GET /api/export/workout-summary/email  → generates the same PDF and emails it

import { Router, Response } from "express";
import nodemailer from "nodemailer";
import Workout from "../models/workout.model";
import User from "../models/user.model";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";
import { generateWorkoutSummaryPdf } from "../utils/pdfGenerator";

const router = Router();

// ─── GET /api/export/workout-summary/pdf ─────────────────────────────────────
// Streams the generated PDF directly to the client as a file download.

router.get("/workout-summary/pdf", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.authUser!.userId, { password: 0 });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const completedWorkouts = await Workout.find({
      userId: req.authUser!.userId,
      status: "completed",
    }).sort({ scheduledAt: -1 });

    const pdfBuffer = await generateWorkoutSummaryPdf(user, completedWorkouts);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=budifit-workout-summary.pdf");
    res.setHeader("Content-Length", pdfBuffer.length.toString());
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("PDF export error:", error);
    res.status(500).json({ message: "Failed to export PDF" });
  }
});

// ─── GET /api/export/workout-summary/email ────────────────────────────────────
// Generates the same PDF and emails it to the authenticated user via Gmail SMTP.

router.get("/workout-summary/email", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.authUser!.userId, { password: 0 });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.error("GMAIL_USER or GMAIL_APP_PASSWORD is missing from .env");
      res.status(500).json({ message: "Email service is not configured" });
      return;
    }

    const completedWorkouts = await Workout.find({
      userId: req.authUser!.userId,
      status: "completed",
    }).sort({ scheduledAt: -1 });

    const pdfBuffer = await generateWorkoutSummaryPdf(user, completedWorkouts);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    await transporter.sendMail({
      from:    `BudiFit <${gmailUser}>`,
      to:      user.email,
      subject: "Your BudiFit Workout Summary",
      html: `
        <p>Hi ${user.firstName},</p>
        <p>Attached is your latest workout summary from BudiFit. Keep up the great work! 💪</p>
        <p>— The BudiFit Team</p>
      `,
      attachments: [
        {
          filename: "budifit-workout-summary.pdf",
          content:  pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.status(200).json({ message: `Summary emailed to ${user.email}` });
  } catch (error) {
    console.error("Email export error:", error);
    res.status(500).json({ message: "Failed to send export email" });
  }
});

export default router;