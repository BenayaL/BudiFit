import mongoose, { Document, Schema, Types } from "mongoose";

export type NotificationType =
  | "plan_pending_review"
  | "plan_approved"
  | "plan_deleted_by_coach"
  | "plan_edited_by_coach"
  | "plan_change_requested"
  | "plan_change_resolved"
  | "plan_change_rejected"
  | "plan_generated_by_coach"
  | "coach_disconnected";

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  type: NotificationType;
  message: string;
  planId?: Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "plan_pending_review",
        "plan_approved",
        "plan_deleted_by_coach",
        "plan_edited_by_coach",
        "plan_change_requested",
        "plan_change_resolved",
        "plan_change_rejected",
        "plan_generated_by_coach",
        "coach_disconnected",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    planId: {
      type: Schema.Types.ObjectId,
      ref: "GeneratedWorkoutPlans",
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "Notifications",
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ recipientId: 1, read: 1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notifications ||
  mongoose.model<INotification>("Notifications", NotificationSchema);

export default Notification;
