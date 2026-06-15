import Notification from "../models/notification.model";
import type { NotificationType } from "../models/notification.model";
import type { Types } from "mongoose";

export async function createNotification(data: {
  recipientId: string | Types.ObjectId;
  type: NotificationType;
  message: string;
  planId?: string | Types.ObjectId;
}): Promise<void> {
  try {
    await Notification.create(data);
  } catch (error) {
    console.error("[NOTIFICATION] Failed to create notification:", error);
  }
}
