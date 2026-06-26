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
}): Promise<boolean> {
  try {
    if (data.dedupeKey) {
      // Check regardless of read state so a read reminder is not recreated the same day.
      const exists = await Notification.exists({ dedupeKey: data.dedupeKey });
      if (exists) return false;
    }
    await Notification.create(data);
    return true;
  } catch (error) {
    console.error("[NOTIFICATION] Failed to create notification:", error);
    return false;
  }
}
