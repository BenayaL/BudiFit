import { ModalPortal } from "../../../common/ModalPortal";

interface ClearChatModalProps {
  isClearing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ClearChatModal({ isClearing, onConfirm, onCancel }: ClearChatModalProps) {
  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={onCancel}
      >
        <div
          className="mx-4 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#3B344A] dark:bg-[#211D2B]"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-[#F8F7FB]">
            Clear chat?
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-[#9E97AF]">
            The current conversation will be permanently removed and cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              disabled={isClearing}
              onClick={onCancel}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isClearing}
              onClick={onConfirm}
              className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {isClearing ? "Clearing…" : "Clear chat"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
