import Notification from "../models/notification.model";
import type {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from "../models/notification.model";
import type { Types } from "mongoose";

export async function createNotification(data: {
  recipientId: string | Types.ObjectId;
  type: NotificationType;
  message: string;
  planId?: string | Types.ObjectId;
  traineeId?: string | Types.ObjectId;
  requestId?: string | Types.ObjectId;
  title?: string;
  actionUrl?: string;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  dedupeKey?: string;
}): Promise<void> {
  try {
    if (data.dedupeKey) {
      const exists = await Notification.exists({ dedupeKey: data.dedupeKey, read: false });
      if (exists) return;
    }
    await Notification.create(data);
  } catch (error) {
    console.error("[NOTIFICATION] Failed to create notification:", error);
  }
}
