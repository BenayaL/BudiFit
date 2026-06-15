import { useNotifications } from "./useNotifications";
import type { Notification } from "./notification.models";

const TYPE_LABELS: Record<Notification["type"], string> = {
  plan_pending_review: "New plan pending review",
  plan_approved: "Plan approved",
  plan_deleted_by_coach: "Plan deleted by coach",
  plan_edited_by_coach: "Plan edited by coach",
  plan_change_requested: "Change request from trainee",
};

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

function NotificationPage() {
  const { notifications, isLoading, error, markRead, markAllRead } = useNotifications();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <section className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Inbox</p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Notifications</h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Mark all as read
          </button>
        )}
      </section>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-4xl">🔔</p>
          <h2 className="mt-4 text-xl font-extrabold text-slate-900">You're all caught up</h2>
          <p className="mt-2 text-slate-500">No notifications yet.</p>
        </section>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <article
              key={n.id}
              className={`rounded-3xl border p-5 shadow-sm transition ${
                n.read
                  ? "border-slate-200 bg-white"
                  : "border-purple-200 bg-purple-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
                    {TYPE_LABELS[n.type] ?? n.type}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{n.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => void markRead(n.id)}
                    className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default NotificationPage;
