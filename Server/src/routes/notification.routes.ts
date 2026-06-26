import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Notification from "../models/notification.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";
import {
  createDailyWorkoutReminderForUser,
  createDailyWorkoutRemindersForAllUsers,
} from "../services/dailyReminder.service";

const notificationRouter = express.Router();

// ─── POST /api/notifications/reminders/daily (no JWT — cron secret) ───────────
// Registered BEFORE notificationRouter.use(authenticateToken) so it does not
// require a Bearer token. Protected by CRON_SECRET instead.

notificationRouter.post(
  "/reminders/daily",
  async (req: Request, res: Response) => {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      res.status(503).json({
        success: false,
        message: "CRON_SECRET is not configured on this server.",
      });
      return;
    }

    const headerSecret = req.headers["x-cron-secret"];
    const querySecret = req.query["secret"] as string | undefined;
    const provided =
      (Array.isArray(headerSecret) ? headerSecret[0] : headerSecret) ??
      querySecret;

    if (!provided || provided !== cronSecret) {
      res.status(401).json({ success: false, message: "Invalid or missing cron secret." });
      return;
    }

    try {
      const result = await createDailyWorkoutRemindersForAllUsers();
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error("[CRON] Daily reminder batch failed:", error);
      res.status(500).json({ success: false, message: "Failed to create daily reminders." });
    }
  }
);

// Apply JWT auth to all routes defined below this line.
notificationRouter.use(authenticateToken);

// ─── GET /api/notifications ───────────────────────────────────────────────────
// Generates today's reminder for the requesting user before returning the list,
// so the notification appears on the first poll after login / page load.

notificationRouter.get(
  "/",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      // Fire-and-forget safe: errors are caught inside the service.
      try {
        await createDailyWorkoutReminderForUser(req.authUser.userId);
      } catch {
        // Never let reminder generation break the notifications list.
      }

      const notifications = await Notification.find(
        { recipientId: req.authUser.userId },
        {},
        { sort: { createdAt: -1 }, limit: 50 }
      );

      res.status(200).json({
        notifications: notifications.map((n) => ({
          id: n._id.toString(),
          type: n.type,
          message: n.message,
          planId: n.planId?.toString(),
          traineeId: n.traineeId?.toString(),
          requestId: n.requestId?.toString(),
          title: n.title,
          actionUrl: n.actionUrl,
          category: n.category,
          priority: n.priority,
          read: n.read,
          createdAt: n.createdAt,
        })),
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to get notifications" });
    }
  }
);

// ─── GET /api/notifications/unread-count ─────────────────────────────────────

notificationRouter.get(
  "/unread-count",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      const count = await Notification.countDocuments({
        recipientId: req.authUser.userId,
        read: false,
      });

      res.status(200).json({ count });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).json({ message: "Failed to get unread count" });
    }
  }
);

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────

notificationRouter.patch(
  "/:id/read",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid((req.params.id as string))) {
        res.status(400).json({ message: "Invalid notification ID" });
        return;
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: (req.params.id as string), recipientId: req.authUser.userId },
        { $set: { read: true } },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ message: "Notification not found" });
        return;
      }

      res.status(200).json({ id: notification._id.toString(), read: notification.read });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  }
);

// ─── DELETE /api/notifications/read ──────────────────────────────────────────
// Must be defined before /:id to prevent Express matching "read" as a param.

notificationRouter.delete(
  "/read",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      await Notification.deleteMany({
        recipientId: req.authUser.userId,
        read: true,
      });

      res.status(200).json({ message: "Read notifications deleted" });
    } catch (error) {
      console.error("Delete read notifications error:", error);
      res.status(500).json({ message: "Failed to delete read notifications" });
    }
  }
);

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────

notificationRouter.delete(
  "/:id",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
        res.status(400).json({ message: "Invalid notification ID" });
        return;
      }

      const deleted = await Notification.findOneAndDelete({
        _id: req.params.id as string,
        recipientId: req.authUser.userId,
      });

      if (!deleted) {
        res.status(404).json({ message: "Notification not found" });
        return;
      }

      res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
      console.error("Delete notification error:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  }
);

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────

notificationRouter.patch(
  "/read-all",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      await Notification.updateMany(
        { recipientId: req.authUser.userId, read: false },
        { $set: { read: true } }
      );

      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all read error:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  }
);

export default notificationRouter;
