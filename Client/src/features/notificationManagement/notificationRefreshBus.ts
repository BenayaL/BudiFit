// Lightweight module-level event bus for triggering immediate notification
// refreshes after actions that are likely to produce new notifications.
//
// Usage:
//   Call notifyNotificationsChanged() after a successful action.
//   NotificationToastContainer and useNotifications subscribe automatically.

type Listener = () => void;

const listeners = new Set<Listener>();

export function notifyNotificationsChanged(): void {
  listeners.forEach((fn) => fn());
}

export function subscribeToNotificationRefresh(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
