import express, { Response } from "express";
import mongoose from "mongoose";
import User, { generateCoachCode } from "../models/user.model";
import GeneratedWorkoutPlan from "../models/generatedWorkoutPlan.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";
import { createNotification } from "../helpers/notification.helper";

const coachConnectionsRouter = express.Router();

// GET /api/coach-connections/me
// For a trainee: returns current coach info or null.
// For a coach: returns their connection code (generating one if missing).
coachConnectionsRouter.get(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;
      const role = req.authUser?.role;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      if (role === "coach") {
        let coach = await User.findById(userId, { coachConnectionCode: 1 });

        if (!coach) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        // Generate code lazily if it was missing (e.g. pre-existing coaches)
        if (!coach.coachConnectionCode) {
          let code: string | undefined;
          for (let i = 0; i < 10; i++) {
            const candidate = generateCoachCode();
            const conflict = await User.findOne({ coachConnectionCode: candidate });
            if (!conflict) { code = candidate; break; }
          }
          if (!code) {
            res.status(500).json({ message: "Failed to generate coach code" });
            return;
          }
          coach = await User.findByIdAndUpdate(
            userId,
            { $set: { coachConnectionCode: code } },
            { new: true, projection: { coachConnectionCode: 1 } }
          );
        }

        res.status(200).json({
          role: "coach",
          coachCode: coach!.coachConnectionCode,
        });
        return;
      }

      // Trainee: return connected coach info
      const trainee = await User.findById(userId, { coachId: 1 });

      if (!trainee) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (!trainee.coachId) {
        res.status(200).json({ role: "trainee", coach: null });
        return;
      }

      const coach = await User.findById(
        trainee.coachId,
        { firstName: 1, lastName: 1, email: 1, coachConnectionCode: 1 }
      );

      if (!coach) {
        // Coach was deleted — clean up the stale reference
        await User.findByIdAndUpdate(userId, { $unset: { coachId: 1 } });
        res.status(200).json({ role: "trainee", coach: null });
        return;
      }

      res.status(200).json({
        role: "trainee",
        coach: {
          id: coach._id.toString(),
          firstName: coach.firstName,
          lastName: coach.lastName,
          email: coach.email,
          coachCode: coach.coachConnectionCode,
        },
      });
    } catch (error) {
      console.error("Failed to get coach connection:", error);
      res.status(500).json({ message: "Failed to get coach connection" });
    }
  }
);

// POST /api/coach-connections/connect
// Body: { coachCode: string }
// Trainee only — connect to a coach using their code.
coachConnectionsRouter.post(
  "/connect",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;
      const role = req.authUser?.role;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      if (role !== "trainee") {
        res.status(403).json({ message: "Only trainees can connect to a coach" });
        return;
      }

      const { coachCode } = req.body;

      if (!coachCode || typeof coachCode !== "string") {
        res.status(400).json({ message: "coachCode is required" });
        return;
      }

      const coach = await User.findOne(
        { coachConnectionCode: coachCode.trim().toUpperCase(), role: "coach" },
        { firstName: 1, lastName: 1, email: 1, coachConnectionCode: 1 }
      );

      if (!coach) {
        res.status(404).json({ message: "No coach found with that code" });
        return;
      }

      const trainee = await User.findById(userId, { coachId: 1, firstName: 1, lastName: 1 });

      if (trainee?.coachId?.toString() === coach._id.toString()) {
        res.status(409).json({ message: "Already connected to this coach" });
        return;
      }

      await User.findByIdAndUpdate(userId, { $set: { coachId: coach._id } });

      // Notify coach about the new trainee connection
      await createNotification({
        recipientId: coach._id as mongoose.Types.ObjectId,
        type: "trainee_connected",
        message: `${trainee!.firstName} ${trainee!.lastName} connected to you as a trainee.`,
        traineeId: new mongoose.Types.ObjectId(userId),
        title: "New trainee connected",
        actionUrl: "coach-trainee-profile",
        category: "coach_action",
        dedupeKey: `trainee_connected:${coach._id.toString()}:${userId}`,
      });

      // Transition any active plans to pending_review so the coach must approve them
      await GeneratedWorkoutPlan.updateMany(
        { userId, status: "active", approvalStatus: "not_required" },
        {
          $set: {
            status: "draft",
            approvalStatus: "pending_review",
            coachId: coach._id,
          },
          $unset: { reviewedByCoachId: 1, reviewedAt: 1 },
        }
      );

      // Send per-plan notifications to both coach and trainee
      const transitionedPlans = await GeneratedWorkoutPlan.find(
        { userId, status: "draft", approvalStatus: "pending_review", coachId: coach._id },
        { _id: 1 }
      );

      for (const plan of transitionedPlans) {
        await createNotification({
          recipientId: coach._id as mongoose.Types.ObjectId,
          type: "plan_pending_review",
          message: "A trainee connected to you and has an existing plan awaiting your review.",
          planId: plan._id as mongoose.Types.ObjectId,
          title: "Plan waiting for review",
          actionUrl: "coach-plan-review",
          category: "coach_action",
          dedupeKey: `plan_pending_review:${coach._id.toString()}:${(plan._id as mongoose.Types.ObjectId).toString()}`,
        });
        await createNotification({
          recipientId: userId,
          type: "plan_pending_review",
          message: "Your plan now requires coach approval.",
          planId: plan._id as mongoose.Types.ObjectId,
          title: "Plan awaiting coach approval",
          category: "trainee_update",
        });
      }

      res.status(200).json({
        message: "Connected to coach successfully",
        coach: {
          id: coach._id.toString(),
          firstName: coach.firstName,
          lastName: coach.lastName,
          email: coach.email,
          coachCode: coach.coachConnectionCode,
        },
      });
    } catch (error) {
      console.error("Failed to connect to coach:", error);
      res.status(500).json({ message: "Failed to connect to coach" });
    }
  }
);

// DELETE /api/coach-connections/me
// Trainee only — disconnect from current coach.
coachConnectionsRouter.delete(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;
      const role = req.authUser?.role;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      if (role !== "trainee") {
        res.status(403).json({ message: "Only trainees can disconnect from a coach" });
        return;
      }

      // Save oldCoachId and name before clearing the relationship
      const traineeUser = await User.findById(userId, { coachId: 1, firstName: 1, lastName: 1 });
      if (!traineeUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const oldCoachId = traineeUser.coachId;

      // Clear coachId from user
      await User.findByIdAndUpdate(userId, { $unset: { coachId: 1 } }, { new: true });

      if (oldCoachId) {
        // ── Pending drafts: never delete — always convert to self-managed active ──
        //
        // Find all pending-review drafts sorted newest-first.
        // Convert the newest to active; permanently delete legacy duplicates (should not
        // exist under normal operation but may exist in pre-fix data).
        const pendingDrafts = await GeneratedWorkoutPlan.find(
          { userId, status: "draft", approvalStatus: "pending_review" },
          { _id: 1 }
        ).sort({ updatedAt: -1 });

        let pendingBecameActive = false;

        if (pendingDrafts.length > 0) {
          const [newest, ...olderDuplicates] = pendingDrafts;

          await GeneratedWorkoutPlan.updateOne(
            { _id: newest._id },
            {
              $set: { status: "active", approvalStatus: "not_required" },
              $unset: { coachId: 1, reviewedByCoachId: 1, reviewedAt: 1, archivedAt: 1 },
            }
          );
          pendingBecameActive = true;

          if (olderDuplicates.length > 0) {
            await GeneratedWorkoutPlan.deleteMany({
              _id: { $in: olderDuplicates.map((p) => p._id) },
            });
          }
        }

        // ── Active plans: clear all coach-management fields ───────────────────────
        //
        // Covers both previously-approved plans and the plan just converted above.
        await GeneratedWorkoutPlan.updateMany(
          { userId, status: "active" },
          {
            $set: { approvalStatus: "not_required" },
            $unset: { coachId: 1, reviewedByCoachId: 1, reviewedAt: 1 },
          }
        );

        // ── Completed plans: clear coach-management fields ────────────────────────
        await GeneratedWorkoutPlan.updateMany(
          { userId, status: "completed", coachId: oldCoachId },
          {
            $set: { approvalStatus: "not_required" },
            $unset: { coachId: 1, reviewedByCoachId: 1, reviewedAt: 1 },
          }
        );

        // ── Notify trainee ────────────────────────────────────────────────────────
        await createNotification({
          recipientId: userId,
          type: "coach_disconnected",
          message: pendingBecameActive
            ? "Your pending workout plan is now available and under your control."
            : "You are now managing your workout plans independently.",
          title: "Disconnected from coach",
          category: "system",
        });

        // ── Notify coach ──────────────────────────────────────────────────────────
        const traineeName = `${traineeUser.firstName} ${traineeUser.lastName}`.trim();
        await createNotification({
          recipientId: oldCoachId,
          type: "trainee_disconnected",
          message: `${traineeName} disconnected from you and is now training independently.`,
          traineeId: new mongoose.Types.ObjectId(userId),
          title: "Trainee disconnected",
          actionUrl: "coach-trainees",
          category: "system",
          priority: "normal",
          dedupeKey: `trainee_disconnected:${oldCoachId.toString()}:${userId}`,
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Failed to disconnect from coach:", error);
      res.status(500).json({ message: "Failed to disconnect from coach" });
    }
  }
);

export default coachConnectionsRouter;
