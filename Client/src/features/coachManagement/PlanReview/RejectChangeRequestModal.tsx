import { useState } from "react";

interface RejectChangeRequestModalProps {
  traineeName: string;
  planTitle: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function RejectChangeRequestModal({
  traineeName,
  planTitle,
  onConfirm,
  onClose,
}: RejectChangeRequestModalProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (isRejecting) return;
    setIsRejecting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setIsRejecting(false);
      setError(
        err instanceof Error
          ? err.message
          : "The request could not be rejected. Please try again."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#3B344A] dark:bg-[#211D2B]">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-[#F8F7FB]">Reject change request?</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-[#C9C4D6]">
          <span className="font-semibold dark:text-[#F8F7FB]">{traineeName}</span> requested changes to{" "}
          <span className="font-semibold dark:text-[#F8F7FB]">"{planTitle}"</span>. The trainee will be notified
          that the request was declined and will be able to submit a new request.
        </p>

        {error && (
          <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isRejecting}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isRejecting}
            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isRejecting ? "Rejecting…" : "Reject request"}
          </button>
        </div>
      </div>
    </div>
  );
}
