import { useEffect } from "react";
import { ModalPortal } from "../../../common/ModalPortal";

interface SuccessModalProps {
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  onClose: () => void;
}

export function SuccessModal({
  title,
  message,
  primaryLabel,
  onPrimary,
  onClose,
}: SuccessModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-desc"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* X close */}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Green checkmark */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <h2
            id="success-modal-title"
            className="mt-5 text-center text-xl font-extrabold text-slate-900"
          >
            {title}
          </h2>
          <p
            id="success-modal-desc"
            className="mt-2 text-center text-sm text-slate-500"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-3">
            <button
              type="button"
              onClick={onPrimary}
              className="w-full rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Stay here
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default SuccessModal;
