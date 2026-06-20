import { useState, useEffect } from "react";

const MAX_LENGTH = 1000;

interface ChangeRequestModalProps {
  planTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

export function ChangeRequestModal({
  planTitle,
  isOpen,
  onClose,
  onSubmit,
}: ChangeRequestModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMessage("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please describe what you would like your coach to change.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(trimmed);
      setMessage("");
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(
        err instanceof Error
          ? err.message
          : "The request could not be sent. Please try again."
      );
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-[#211D2B] dark:border dark:border-[#3B344A]">
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-[#F8F7FB]">Request changes</h3>
        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-[#C9C4D6]">{planTitle}</p>
        <p className="mt-3 text-sm text-slate-500 dark:text-[#9E97AF]">
          Tell your coach what you would like to change in this workout plan.
        </p>

        <textarea
          rows={4}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value.slice(0, MAX_LENGTH));
            if (error) setError(null);
          }}
          disabled={isSubmitting}
          placeholder="For example: I would like fewer leg exercises and more upper-body work."
          className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:placeholder:text-[#9E97AF]"
        />
        <p className="mt-1 text-right text-xs text-slate-400 dark:text-[#9E97AF]">
          {message.length}/{MAX_LENGTH}
        </p>

        {error && (
          <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !message.trim()}
            className="flex-1 rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting ? "Sending…" : "Send request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangeRequestModal;
