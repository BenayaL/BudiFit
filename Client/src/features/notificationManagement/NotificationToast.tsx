import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Notification } from "./notification.models";
import {
  getCategoryConfig,
  getNotificationActionLabel,
  getNotificationTitle,
  isNotificationActionable,
  type NotificationActionCallbacks,
  executeNotificationAction,
} from "./notification.helpers";
import { notificationService } from "./notificationService";

interface NotificationToastProps {
  notification: Notification;
  token: string;
  callbacks: NotificationActionCallbacks;
  onRemove: (id: string) => void;
}

const VISIBLE_DURATION = 5500;
const EXIT_DURATION = 300;

export function NotificationToast({
  notification: n,
  token,
  callbacks,
  onRemove,
}: NotificationToastProps) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitingRef = useRef(false);

  function triggerClose() {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    setTimeout(() => onRemove(n.id), EXIT_DURATION);
  }

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10);
    const dismissTimer = setTimeout(() => triggerClose(), VISIBLE_DURATION);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(dismissTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAction() {
    void notificationService.markRead(n.id, token);
    triggerClose();
    executeNotificationAction(n, callbacks);
  }

  const cfg = getCategoryConfig(n.category);
  const { Icon, bg, iconColor, borderColor } = cfg;
  const title = getNotificationTitle(n);
  const hasAction = isNotificationActionable(n);

  const isShown = visible && !exiting;

  return (
    <div
      role="alert"
      className={`
        pointer-events-auto
        w-full max-w-md
        rounded-2xl border border-slate-200 bg-white
        dark:border-[#3B344A] dark:bg-[#211D2B]
        shadow-xl border-l-4 ${borderColor}
        transition-all duration-300 ease-out
        ${isShown
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-4 opacity-0 scale-95"
        }
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon bubble */}
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 leading-snug dark:text-[#F8F7FB]">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500 leading-snug line-clamp-2 dark:text-[#9E97AF]">{n.message}</p>
          {hasAction && (
            <button
              type="button"
              onClick={handleAction}
              className="mt-2 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-purple-700 active:scale-95"
            >
              {getNotificationActionLabel(n)}
            </button>
          )}
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={() => triggerClose()}
          aria-label="Dismiss notification"
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-[#9E97AF] dark:hover:bg-[#2A2436] dark:hover:text-[#C9C4D6]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
