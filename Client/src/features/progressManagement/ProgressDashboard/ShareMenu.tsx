import { useEffect, useRef, useState } from "react";
import { exportService } from "../../workoutManagement/exportService";
import { useAuth } from "../../../app/AuthContext";

const PDF_FILENAME = "budifit-workout-summary.pdf";

type OpStatus = "idle" | "working" | "success" | "error";

export function ShareMenu() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<OpStatus>("idle");
  const [feedback, setFeedback] = useState("");

  const isWorking = status === "working";

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Reset feedback when reopened
  const prevOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      setStatus("idle");
      setFeedback("");
    }
    prevOpen.current = isOpen;
  }, [isOpen]);

  function triggerBlobDownload(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = PDF_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleDownload() {
    if (!token || isWorking) return;
    setStatus("working");
    setFeedback("");
    try {
      const blob = await exportService.downloadPdf(token);
      triggerBlobDownload(blob);
      setStatus("success");
      setFeedback("PDF downloaded!");
    } catch (err) {
      console.error("[EXPORT] Failed to download PDF:", err);
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Failed to generate PDF. Please try again.");
    }
  }

  async function handleEmail() {
    if (!token || isWorking) return;
    setStatus("working");
    setFeedback("");
    try {
      const result = await exportService.sendByEmail(token);
      setStatus("success");
      setFeedback(result.message ?? "Summary emailed!");
    } catch (err) {
      console.error("[EXPORT] Failed to email summary:", err);
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Failed to send email. Please try again.");
    }
  }

  async function handleShare() {
    if (!token || isWorking) return;
    setStatus("working");
    setFeedback("");
    try {
      const blob = await exportService.downloadPdf(token);
      const file = new File([blob], PDF_FILENAME, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My BudiFit Progress!",
          text: "Check out my latest workout summary from BudiFit 💪",
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "My BudiFit Progress!",
          text: "Check out my progress on BudiFit 💪",
          url: window.location.origin,
        });
        triggerBlobDownload(blob);
      } else {
        triggerBlobDownload(blob);
        setStatus("success");
        setFeedback("Sharing isn't supported on this browser — PDF downloaded instead.");
        return;
      }
      setStatus("success");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        return;
      }
      console.error("[EXPORT] Failed to share summary:", err);
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Failed to share. Please try again.");
    }
  }

  return (
    <>
      {/* ── Trigger button — matches WorkoutListPage share button style ── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share Progress 📢
      </button>

      {/* ── Modal — same structure as ShareModal.tsx ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm"
          onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Share Progress</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {/* Download PDF */}
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={isWorking}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                Download as PDF
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={() => void handleEmail()}
                disabled={isWorking}
                className="flex w-full items-center gap-3 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email to myself
              </button>

              {/* Social share */}
              <button
                type="button"
                onClick={() => void handleShare()}
                disabled={isWorking}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share to social media
              </button>
            </div>

            {/* Spinner while working */}
            {isWorking && (
              <div className="mt-4 flex justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
              </div>
            )}

            {/* Feedback */}
            {feedback && !isWorking && (
              <p
                className={`mt-4 text-center text-sm ${
                  status === "error" ? "text-red-500" : "text-slate-500"
                }`}
              >
                {feedback}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ShareMenu;
