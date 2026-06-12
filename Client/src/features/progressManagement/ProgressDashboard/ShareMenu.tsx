import { useEffect, useRef, useState } from "react";
import { exportService } from "../../workoutManagement/exportService";
import { useAuth } from "../../../app/AuthContext";

const PDF_FILENAME = "budifit-workout-summary.pdf";

type ShareStatus = "idle" | "working" | "error";

export function ShareMenu() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<ShareStatus>("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (!token) return;
    setStatus("working");
    setFeedback(null);
    try {
      const blob = await exportService.downloadPdf(token);
      triggerBlobDownload(blob);
      setFeedback("PDF downloaded!");
    } catch (err) {
      console.error("[EXPORT] Failed to download PDF:", err);
      setStatus("error");
      setFeedback("Failed to generate PDF. Please try again.");
      return;
    } finally {
      setStatus("idle");
    }
    setIsOpen(false);
  }

  async function handleEmail() {
    if (!token) return;
    setStatus("working");
    setFeedback(null);
    try {
      const result = await exportService.sendByEmail(token);
      setFeedback(result.message ?? "Summary emailed!");
    } catch (err) {
      console.error("[EXPORT] Failed to email summary:", err);
      setStatus("error");
      setFeedback("Failed to send email. Please try again.");
      return;
    } finally {
      setStatus("idle");
    }
    setIsOpen(false);
  }

  async function handleShare() {
    if (!token) return;
    setStatus("working");
    setFeedback(null);

    try {
      const blob = await exportService.downloadPdf(token);
      const file = new File([blob], PDF_FILENAME, { type: "application/pdf" });

      // Prefer sharing the file directly (lets the user pick Instagram, X, WhatsApp, etc.)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My BudiFit Progress!",
          text: "Check out my latest workout summary from BudiFit 💪",
          files: [file],
        });
      } else if (navigator.share) {
        // Fallback for browsers that support share() but not file sharing
        await navigator.share({
          title: "My BudiFit Progress!",
          text: "Check out my progress on BudiFit 💪",
          url: window.location.origin,
        });
        // Also trigger a download so the user still gets the PDF
        triggerBlobDownload(blob);
      } else {
        // No Web Share support at all — fall back to downloading the file
        triggerBlobDownload(blob);
        setFeedback("Sharing isn't supported on this browser — PDF downloaded instead.");
      }
    } catch (err) {
      // AbortError happens when the user cancels the share sheet — not a real error
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        return;
      }
      console.error("[EXPORT] Failed to share summary:", err);
      setStatus("error");
      setFeedback("Failed to share. Please try again.");
      return;
    } finally {
      setStatus("idle");
    }
    setIsOpen(false);
  }

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen((open) => !open)}
        disabled={status === "working"}
        className="px-4 py-2 bg-blue-500 text-white rounded font-medium shadow-md hover:bg-blue-600 transition-colors disabled:opacity-60"
      >
        {status === "working" ? "Working…" : "Share Progress 📢"}
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-slate-100 z-50">
          <div className="flex flex-col gap-1">
            <button
              onClick={handleDownload}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
            >
              📄 Download as PDF
            </button>
            <button
              onClick={handleEmail}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
            >
              ✉️ Email to myself
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
            >
              🔗 Share to social media
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p
          className={`mt-2 text-sm ${
            status === "error" ? "text-red-500" : "text-slate-500"
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

export default ShareMenu;
