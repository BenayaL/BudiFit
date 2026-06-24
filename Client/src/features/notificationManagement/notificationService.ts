// notificationManagement — service layer for notification API calls.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";
import type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
} from "./notification.models";

export const notificationService = {
  async getNotifications(token: string): Promise<Notification[]> {
    const response = await httpClient.get<NotificationsResponse>(
      ENDPOINTS.notifications.list,
      token
    );
    return response.notifications;
  },

  async getUnreadCount(token: string): Promise<number> {
    const response = await httpClient.get<UnreadCountResponse>(
      ENDPOINTS.notifications.unreadCount,
      token
    );
    return response.count;
  },

  markRead: (id: string, token: string): Promise<void> =>
    httpClient.patch<void, Record<string, never>>(
      ENDPOINTS.notifications.markRead(id),
      {},
      token
    ),

  markAllRead: (token: string): Promise<void> =>
    httpClient.patch<void, Record<string, never>>(
      ENDPOINTS.notifications.markAllRead,
      {},
      token
    ),

  deleteNotification: (id: string, token: string): Promise<void> =>
    httpClient.delete<void>(ENDPOINTS.notifications.deleteOne(id), token),

  clearReadNotifications: (token: string): Promise<void> =>
    httpClient.delete<void>(ENDPOINTS.notifications.deleteRead, token),
};
