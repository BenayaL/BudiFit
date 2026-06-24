import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { useNotifications } from "./useNotifications";
import type { Notification } from "./notification.models";
import type { Page } from "../../app/app.types";
import {
  CATEGORY_CONFIG,
  TYPE_LABELS,
  getNotificationActionLabel,
  isActionNeeded,
  isNotificationActionable,
  executeNotificationAction,
} from "./notification.helpers";

type NotificationFilter = "all" | "unread" | "action_needed";

interface NotificationPageProps {
  onChangePage: (page: Page) => void;
  onReviewPlan: (planId: string) => void;
  onViewTraineeProfile?: (traineeId: string) => void;
}

function NotificationIcon({ category }: { category?: string }) {
  const cfg = category ? CATEGORY_CONFIG[category] : undefined;
  if (!cfg) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
        <Bell className="h-5 w-5 text-slate-500" />
      </span>
    );
  }
  const { Icon, bg, iconColor } = cfg;
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${bg}`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationPage({ onChangePage, onReviewPlan, onViewTraineeProfile }: NotificationPageProps) {
  const { notifications, isLoading, error, markRead, markAllRead, deleteNotification, clearRead } = useNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "action_needed") return isActionNeeded(n);
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleAction(n: Notification) {
    void markRead(n.id);
    executeNotificationAction(n, {
      onChangePage,
      onReviewPlan,
      onViewTraineeProfile: onViewTraineeProfile ?? (() => undefined),
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  const emptyMessage =
    filter === "unread"
      ? { heading: "No unread notifications", sub: 'Switch to "All" to see everything.' }
      : filter === "action_needed"
      ? { heading: "Nothing needs action", sub: 'Switch to "All" to see everything.' }
      : { heading: "You're all caught up", sub: "No notifications yet." };

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <section className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Inbox</p>
          <h1 className="mt-2 flex items-center gap-3 text-4xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">
            Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-base font-bold text-white">
                {unreadCount}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some((n) => n.read) && (
            <button
              type="button"
              onClick={() => void clearRead()}
              className="flex items-center gap-1.5 rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50 dark:border-red-900/40 dark:bg-[#211D2B] dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Clear read
            </button>
          )}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#211D2B] dark:text-[#C9C4D6] dark:hover:bg-[#2A2436]"
            >
              Mark all as read
            </button>
          )}
        </div>
      </section>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {(["all", "unread", "action_needed"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
              filter === f
                ? "bg-purple-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#211D2B] dark:text-[#C9C4D6] dark:hover:bg-[#2A2436]"
            }`}
          >
            {f === "all" ? "All" : f === "unread" ? "Unread" : "Action needed"}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
          <p className="text-4xl">🔔</p>
          <h2 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">{emptyMessage.heading}</h2>
          <p className="mt-2 text-slate-500 dark:text-[#9E97AF]">{emptyMessage.sub}</p>
        </section>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const hasAction = isNotificationActionable(n);
            return (
              <article
                key={n.id}
                role={hasAction ? "button" : undefined}
                tabIndex={hasAction ? 0 : undefined}
                onClick={hasAction ? () => handleAction(n) : undefined}
                onKeyDown={
                  hasAction
                    ? (e) => { if (e.key === "Enter" || e.key === " ") handleAction(n); }
                    : undefined
                }
                className={`rounded-3xl border p-5 shadow-sm transition ${
                  n.read
                    ? "border-slate-200 bg-white dark:border-[#3B344A] dark:bg-[#211D2B]"
                    : "border-purple-200 bg-purple-50 dark:border-purple-800/50 dark:bg-purple-900/20"
                } ${hasAction ? "cursor-pointer hover:border-purple-300 hover:shadow-md dark:hover:border-purple-700" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <NotificationIcon category={n.category} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-purple-600" aria-hidden="true" />
                      )}
                      <p className={`text-sm font-bold ${n.read ? "text-slate-700 dark:text-[#C9C4D6]" : "text-slate-900 dark:text-[#F8F7FB]"}`}>
                        {n.title ?? TYPE_LABELS[n.type] ?? n.type}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-[#9E97AF]">{n.message}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <p className="text-xs text-slate-400 dark:text-[#9E97AF]">{timeAgo(n.createdAt)}</p>
                      {hasAction && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleAction(n); }}
                          className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-purple-700"
                        >
                          {getNotificationActionLabel(n)}
                        </button>
                      )}
                      {!n.read && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); void markRead(n.id); }}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); void deleteNotification(n.id); }}
                        className="ml-auto rounded-xl border border-slate-200 bg-white p-1.5 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#9E97AF] dark:hover:border-red-900/40 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default NotificationPage;
