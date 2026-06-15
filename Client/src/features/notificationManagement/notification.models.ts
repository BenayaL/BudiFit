// notificationManagement — data contracts for in-app notifications.

export type NotificationType =
  | "plan_pending_review"
  | "plan_approved"
  | "plan_deleted_by_coach"
  | "plan_edited_by_coach"
  | "plan_change_requested";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  planId?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface UnreadCountResponse {
  count: number;
}
