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
  | "coach_disconnected"
  | "trainee_connected"
  | "trainee_disconnected"
  | "ai_plan_generated"
  | "ai_plan_replaced"
  | "today_workout_ready"
  | "workout_completed"
  | "streak_milestone"
  | "missed_workout"
  | "no_active_plan";

export type NotificationCategory =
  | "coach_action"
  | "trainee_update"
  | "workout_reminder"
  | "progress"
  | "system";

export type NotificationPriority = "low" | "normal" | "high";

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  type: NotificationType;
  message: string;
  planId?: Types.ObjectId;
  traineeId?: Types.ObjectId;
  requestId?: Types.ObjectId;
  title?: string;
  actionUrl?: string;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  dedupeKey?: string;
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
        "trainee_connected",
        "trainee_disconnected",
        "ai_plan_generated",
        "ai_plan_replaced",
        "today_workout_ready",
        "workout_completed",
        "streak_milestone",
        "missed_workout",
        "no_active_plan",
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

    traineeId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },

    requestId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutPlanChangeRequests",
    },

    title: {
      type: String,
      trim: true,
    },

    actionUrl: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      enum: ["coach_action", "trainee_update", "workout_reminder", "progress", "system"],
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high"],
    },

    dedupeKey: {
      type: String,
      sparse: true,
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
NotificationSchema.index({ dedupeKey: 1, read: 1 }, { sparse: true });

const Notification =
  mongoose.models.Notifications ||
  mongoose.model<INotification>("Notifications", NotificationSchema);

export default Notification;
