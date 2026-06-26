import { useEffect } from "react";
import type { ReactNode } from "react";

export interface ShareAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

interface ShareActionModalProps {
  title: string;
  onClose: () => void;
  actions: ShareAction[];
  isLoading?: boolean;
  feedback?: string;
  feedbackIsError?: boolean;
}

export function ShareActionModal({
  title,
  onClose,
  actions,
  isLoading,
  feedback,
  feedbackIsError,
}: ShareActionModalProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-[#211D2B] dark:border dark:border-[#3B344A]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-[#F8F7FB]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 dark:text-[#9E97AF] dark:hover:bg-[#2A2436]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={
                action.variant === "primary"
                  ? "flex w-full items-center gap-3 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  : "flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
              }
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="mt-4 flex justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
          </div>
        )}

        {feedback && !isLoading && (
          <p
            className={`mt-4 text-center text-sm ${
              feedbackIsError
                ? "text-red-500 dark:text-red-400"
                : "text-slate-500 dark:text-[#9E97AF]"
            }`}
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}

export default ShareActionModal;
