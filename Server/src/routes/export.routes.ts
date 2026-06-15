// Routes matching ENDPOINTS.export in the client:
//   GET /api/export/workout-summary/pdf          → streams the workout-summary PDF (Dashboard)
//   GET /api/export/workout-summary/email        → emails the workout-summary PDF (Dashboard)
//   GET /api/export/workout-plan/:planId/pdf     → streams a single generated plan as PDF
//   GET /api/export/workout-plan/:planId/email   → emails that plan PDF to the authenticated user
//   GET /api/export/workout-history/pdf          → streams the completed-history PDF
//   GET /api/export/workout-history/email        → emails the history PDF to the authenticated user

import { Router, Response } from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Workout from "../models/workout.model";
import GeneratedWorkoutPlan from "../models/generatedWorkoutPlan.model";
import User from "../models/user.model";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  generateWorkoutSummaryPdf,
  generateWorkoutPlanPdf,
  generateWorkoutHistoryPdf,
} from "../utils/pdfGenerator";

const router = Router();

// ─── Nodemailer helper ────────────────────────────────────────────────────────
// Returns a configured transporter or throws if env vars are missing.

function createMailTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    throw new Error("Email service is not configured");
  }

  return {
    transporter: nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    }),
    from: `BudiFit <${gmailUser}>`,
  };
}

// ─── GET /api/export/workout-summary/pdf ─────────────────────────────────────

router.get(
  "/workout-summary/pdf",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
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
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=budifit-workout-summary.pdf"
      );
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("PDF export error:", error);
      res.status(500).json({ message: "Failed to export PDF" });
    }
  }
);

// ─── GET /api/export/workout-summary/email ────────────────────────────────────

router.get(
  "/workout-summary/email",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.authUser!.userId, { password: 0 });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      let transporter: ReturnType<typeof nodemailer.createTransport>;
      let from: string;
      try {
        ({ transporter, from } = createMailTransporter());
      } catch {
        res.status(500).json({ message: "Email service is not configured" });
        return;
      }

      const completedWorkouts = await Workout.find({
        userId: req.authUser!.userId,
        status: "completed",
      }).sort({ scheduledAt: -1 });

      const pdfBuffer = await generateWorkoutSummaryPdf(user, completedWorkouts);

      await transporter.sendMail({
        from,
        to:      user.email,
        subject: "Your BudiFit Workout Summary",
        html: `
          <p>Hi ${user.firstName},</p>
          <p>Attached is your latest workout summary from BudiFit. Keep up the great work! 💪</p>
          <p>— The BudiFit Team</p>
        `,
        attachments: [
          {
            filename:    "budifit-workout-summary.pdf",
            content:     pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      res.status(200).json({ message: `Summary emailed to ${user.email}` });
    } catch (error) {
      console.error("Email export error:", error);
      res.status(500).json({ message: "Failed to send export email" });
    }
  }
);

// ─── GET /api/export/workout-plan/:planId/pdf ────────────────────────────────

router.get(
  "/workout-plan/:planId/pdf",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const planId = req.params.planId as string;

      if (!mongoose.Types.ObjectId.isValid(planId)) {
        res.status(400).json({ message: "Invalid plan ID" });
        return;
      }

      const user = await User.findById(req.authUser!.userId, { password: 0 });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const plan = await GeneratedWorkoutPlan.findOne({
        _id: planId,
        userId: req.authUser!.userId,
      });

      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }

      if (plan.approvalStatus === "pending_review") {
        res.status(403).json({ message: "This plan is pending coach review and cannot be exported" });
        return;
      }

      if (plan.status !== "active" && plan.status !== "completed") {
        res.status(403).json({ message: "Only active or completed plans can be exported" });
        return;
      }

      const pdfBuffer = await generateWorkoutPlanPdf(user, plan);

      const safeName = plan.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=budifit-${safeName}.pdf`
      );
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("Workout plan PDF export error:", error);
      res.status(500).json({ message: "Failed to export workout plan PDF" });
    }
  }
);

// ─── GET /api/export/workout-plan/:planId/email ──────────────────────────────

router.get(
  "/workout-plan/:planId/email",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const planId = req.params.planId as string;

      if (!mongoose.Types.ObjectId.isValid(planId)) {
        res.status(400).json({ message: "Invalid plan ID" });
        return;
      }

      const user = await User.findById(req.authUser!.userId, { password: 0 });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const plan = await GeneratedWorkoutPlan.findOne({
        _id: planId,
        userId: req.authUser!.userId,
      });

      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }

      if (plan.approvalStatus === "pending_review") {
        res.status(403).json({ message: "This plan is pending coach review and cannot be exported" });
        return;
      }

      if (plan.status !== "active" && plan.status !== "completed") {
        res.status(403).json({ message: "Only active or completed plans can be exported" });
        return;
      }

      let transporter: ReturnType<typeof nodemailer.createTransport>;
      let from: string;
      try {
        ({ transporter, from } = createMailTransporter());
      } catch {
        res.status(500).json({ message: "Email service is not configured" });
        return;
      }

      const pdfBuffer = await generateWorkoutPlanPdf(user, plan);

      const safeName = plan.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const attachmentName = `budifit-${safeName}.pdf`;

      await transporter.sendMail({
        from,
        to:      user.email,
        subject: `Your BudiFit Workout Plan: ${plan.title}`,
        html: `
          <p>Hi ${user.firstName},</p>
          <p>Attached is your workout plan <strong>${plan.title}</strong> from BudiFit. Keep training hard! 💪</p>
          <p>— The BudiFit Team</p>
        `,
        attachments: [
          {
            filename:    attachmentName,
            content:     pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      res.status(200).json({ message: `Workout plan emailed to ${user.email}` });
    } catch (error) {
      console.error("Workout plan email export error:", error);
      res.status(500).json({ message: "Failed to send workout plan email" });
    }
  }
);

// ─── GET /api/export/workout-history/pdf ─────────────────────────────────────

router.get(
  "/workout-history/pdf",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.authUser!.userId, { password: 0 });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const [completedPlans, completedWorkouts] = await Promise.all([
        GeneratedWorkoutPlan.find({
          userId: req.authUser!.userId,
          status: "completed",
        }).sort({ updatedAt: -1 }),
        Workout.find({
          userId: req.authUser!.userId,
          status: "completed",
        }).sort({ scheduledAt: -1 }),
      ]);

      if (completedPlans.length === 0 && completedWorkouts.length === 0) {
        res
          .status(404)
          .json({ message: "No completed workout history is available to export" });
        return;
      }

      const pdfBuffer = await generateWorkoutHistoryPdf(
        user,
        completedPlans,
        completedWorkouts
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=budifit-workout-history.pdf"
      );
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("Workout history PDF export error:", error);
      res.status(500).json({ message: "Failed to export workout history PDF" });
    }
  }
);

// ─── GET /api/export/workout-history/email ───────────────────────────────────

router.get(
  "/workout-history/email",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.authUser!.userId, { password: 0 });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const [completedPlans, completedWorkouts] = await Promise.all([
        GeneratedWorkoutPlan.find({
          userId: req.authUser!.userId,
          status: "completed",
        }).sort({ updatedAt: -1 }),
        Workout.find({
          userId: req.authUser!.userId,
          status: "completed",
        }).sort({ scheduledAt: -1 }),
      ]);

      if (completedPlans.length === 0 && completedWorkouts.length === 0) {
        res
          .status(404)
          .json({ message: "No completed workout history is available to export" });
        return;
      }

      let transporter: ReturnType<typeof nodemailer.createTransport>;
      let from: string;
      try {
        ({ transporter, from } = createMailTransporter());
      } catch {
        res.status(500).json({ message: "Email service is not configured" });
        return;
      }

      const pdfBuffer = await generateWorkoutHistoryPdf(
        user,
        completedPlans,
        completedWorkouts
      );

      await transporter.sendMail({
        from,
        to:      user.email,
        subject: "Your BudiFit Workout History",
        html: `
          <p>Hi ${user.firstName},</p>
          <p>Attached is your complete workout history from BudiFit. Great work on your progress! 💪</p>
          <p>— The BudiFit Team</p>
        `,
        attachments: [
          {
            filename:    "budifit-workout-history.pdf",
            content:     pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      res.status(200).json({ message: `Workout history emailed to ${user.email}` });
    } catch (error) {
      console.error("Workout history email export error:", error);
      res.status(500).json({ message: "Failed to send workout history email" });
    }
  }
);

export default router;
