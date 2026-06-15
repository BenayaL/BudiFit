import { useState } from "react";
import { useAuth } from "../../app/AuthContext";
import { exportService } from "./exportService";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ShareTarget =
  | { type: "workout-plan"; planId: string; planTitle: string }
  | { type: "workout-history" };

interface ShareModalProps {
  title: string;
  target: ShareTarget;
  onClose: () => void;
}

type OpStatus = "idle" | "working" | "success" | "error";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pdfFilename(target: ShareTarget): string {
  if (target.type === "workout-plan") {
    const safe = target.planTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `budifit-${safe}.pdf`;
  }
  return "budifit-workout-history.pdf";
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ShareModal({ title, target, onClose }: ShareModalProps) {
  const { token } = useAuth();
  const [status, setStatus] = useState<OpStatus>("idle");
  const [feedback, setFeedback] = useState("");

  const isWorking = status === "working";
  const filename = pdfFilename(target);

  const shareTitle =
    target.type === "workout-plan"
      ? "My BudiFit Workout Plan!"
      : "My BudiFit Workout History!";
  const shareText =
    target.type === "workout-plan"
      ? "Check out my workout plan from BudiFit 💪"
      : "Check out my workout history from BudiFit 💪";

  async function fetchBlob(): Promise<Blob> {
    if (target.type === "workout-plan") {
      return exportService.downloadWorkoutPlanPdf(target.planId, token!);
    }
    return exportService.downloadWorkoutHistoryPdf(token!);
  }

  async function handleDownload() {
    if (!token || isWorking) return;
    setStatus("working");
    setFeedback("");
    try {
      const blob = await fetchBlob();
      triggerBlobDownload(blob, filename);
      setStatus("success");
      setFeedback("PDF downloaded!");
    } catch (err) {
      console.error("[SHARE] Failed to download PDF:", err);
      setStatus("error");
      setFeedback(
        err instanceof Error ? err.message : "Failed to generate PDF. Please try again."
      );
    }
  }

  async function handleEmail() {
    if (!token || isWorking) return;
    setStatus("working");
    setFeedback("");
    try {
      let result: { message: string };
      if (target.type === "workout-plan") {
        result = await exportService.emailWorkoutPlan(target.planId, token);
      } else {
        result = await exportService.emailWorkoutHistory(token);
      }
      setStatus("success");
      setFeedback(result.message ?? "Email sent!");
    } catch (err) {
      console.error("[SHARE] Failed to email PDF:", err);
      setStatus("error");
      setFeedback(
        err instanceof Error ? err.message : "Failed to send email. Please try again."
      );
    }
  }

  async function handleShare() {
    if (!token || isWorking) return;
    setStatus("working");
    setFeedback("");
    try {
      const blob = await fetchBlob();
      const file = new File([blob], filename, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: shareTitle, text: shareText, files: [file] });
      } else if (navigator.share) {
        // Browser supports share() but not file sharing — share URL + download the PDF
        await navigator.share({ title: shareTitle, text: shareText, url: window.location.origin });
        triggerBlobDownload(blob, filename);
      } else {
        // No Web Share API — fall back to download
        triggerBlobDownload(blob, filename);
        setStatus("success");
        setFeedback("Sharing isn't supported on this browser — PDF downloaded instead.");
        return;
      }
      setStatus("success");
    } catch (err) {
      // User cancelled the native share sheet — not an error
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        return;
      }
      console.error("[SHARE] Failed to share PDF:", err);
      setStatus("error");
      setFeedback(
        err instanceof Error ? err.message : "Failed to share. Please try again."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* Download */}
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

          {/* Native share */}
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

        {/* Feedback */}
        {isWorking && (
          <div className="mt-4 flex justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
          </div>
        )}
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
  );
}
