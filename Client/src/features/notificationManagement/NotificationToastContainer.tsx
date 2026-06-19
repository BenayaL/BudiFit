import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../app/AuthContext";
import type { Notification } from "./notification.models";
import { notificationService } from "./notificationService";
import {
  shouldShowNotificationToast,
  isAfterReminderTime,
  type NotificationActionCallbacks,
} from "./notification.helpers";
import { NotificationToast } from "./NotificationToast";
import type { NotificationSettings } from "../userManagement/user.models";

const POLL_INTERVAL_MS = 60_000;
const MAX_VISIBLE_TOASTS = 3;

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  dailyWorkoutReminder: true,
  coachMessages: true,
  challengeUpdates: true,
  reminderTime: "08:00",
};

interface NotificationToastContainerProps extends NotificationActionCallbacks {}

export function NotificationToastContainer(props: NotificationToastContainerProps) {
  const { token, user } = useAuth();
  const [toasts, setToasts] = useState<Notification[]>([]);

  const seenIds = useRef(new Set<string>());
  const isInitialized = useRef(false);

  const settings: NotificationSettings =
    user?.settings?.notifications ?? DEFAULT_NOTIFICATION_SETTINGS;

  const poll = useCallback(async () => {
    if (!token) return;
    try {
      const notifications = await notificationService.getNotifications(token);

      if (!isInitialized.current) {
        // Seed seen set with all existing IDs — no toasts on first load
        notifications.forEach((n) => seenIds.current.add(n.id));
        isInitialized.current = true;
        return;
      }

      const freshOnes = notifications.filter((n) => !seenIds.current.has(n.id));
      if (freshOnes.length === 0) return;

      // Permanently blocked by settings — mark seen now so we never retry them.
      const settingsBlocked = freshOnes.filter((n) => !shouldShowNotificationToast(n, settings));
      settingsBlocked.forEach((n) => seenIds.current.add(n.id));

      // Allowed by settings — check time gate separately.
      const settingsAllowed = freshOnes.filter((n) => shouldShowNotificationToast(n, settings));

      // today_workout_ready before reminderTime: do NOT mark seen yet.
      // It stays un-seen so the next poll can retry once the time has passed.
      const toShow = settingsAllowed.filter(
        (n) => !(n.type === "today_workout_ready" && !isAfterReminderTime(settings))
      );

      // Mark only the notifications we're actually showing as seen.
      toShow.forEach((n) => seenIds.current.add(n.id));

      if (toShow.length === 0) return;

      setToasts((prev) => {
        const combined = [...prev, ...toShow];
        return combined.slice(-MAX_VISIBLE_TOASTS);
      });
    } catch {
      // Silent — toast errors must never surface to the user
    }
  }, [token, settings]);

  useEffect(() => {
    if (!token) return;
    void poll();
    const interval = setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, poll]);

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (!token || toasts.length === 0) return null;

  // Portal to document.body — escapes all parent stacking contexts (including
  // the navbar's backdrop-blur stacking context) so z-[9999] is always respected.
  return createPortal(
    <div
      aria-label="Live notifications"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-24 z-[9999] flex flex-col items-center gap-3 px-4"
    >
      {toasts.map((n) => (
        <NotificationToast
          key={n.id}
          notification={n}
          token={token}
          callbacks={props}
          onRemove={removeToast}
        />
      ))}
    </div>,
    document.body
  );
}
