import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../app/AuthContext";
import type { Notification } from "./notification.models";
import { notificationService } from "./notificationService";
import { subscribeToNotificationRefresh } from "./notificationRefreshBus";

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearRead: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications(token);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    return subscribeToNotificationRefresh(() => void reload());
  }, [reload]);

  const markRead = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await notificationService.markRead(id, token);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // silent
      }
    },
    [token]
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await notificationService.markAllRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, [token]);

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!token) return;
      try {
        await notificationService.deleteNotification(id, token);
        setNotifications((prev) => {
          const next = prev.filter((n) => n.id !== id);
          setUnreadCount(next.filter((n) => !n.read).length);
          return next;
        });
      } catch {
        // silent
      }
    },
    [token]
  );

  const clearRead = useCallback(async () => {
    if (!token) return;
    try {
      await notificationService.clearReadNotifications(token);
      setNotifications((prev) => prev.filter((n) => !n.read));
    } catch {
      // silent
    }
  }, [token]);

  return { notifications, unreadCount, isLoading, error, markRead, markAllRead, deleteNotification, clearRead, reload };
}
