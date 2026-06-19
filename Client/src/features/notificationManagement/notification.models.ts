// notificationManagement — data contracts for in-app notifications.

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

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  planId?: string;
  traineeId?: string;
  requestId?: string;
  title?: string;
  actionUrl?: string;
  category?: string;
  priority?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface UnreadCountResponse {
  count: number;
}
