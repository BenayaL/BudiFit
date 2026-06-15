import express, { Response } from "express";
import mongoose from "mongoose";
import Notification from "../models/notification.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

const notificationRouter = express.Router();

notificationRouter.use(authenticateToken);

// ─── GET /api/notifications ───────────────────────────────────────────────────

notificationRouter.get(
  "/",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.authUser) {
        res.status(401).json({ message: "Authentication required" });
        return;
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
