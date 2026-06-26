import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../app/AuthContext";
import { exportService } from "../../../services/exportService";
import { ShareActionModal } from "../../../common/ShareActionModal";

const PDF_FILENAME = "budifit-workout-summary.pdf";
const SHARE_TITLE = "My BudiFit Progress!";
const SHARE_TEXT = "Check out my latest workout summary from BudiFit 💪";

type OpStatus = "idle" | "working" | "success" | "error";

// ─── Icons ────────────────────────────────────────────────────────────────────

const DownloadIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const EmailIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const SocialShareIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const TriggerIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ShareMenu() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<OpStatus>("idle");
  const [feedback, setFeedback] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [recipientInputError, setRecipientInputError] = useState("");

  const isWorking = status === "working";

  // Reset all state when modal reopens
  const prevOpen = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpen.current) {
      setStatus("idle");
      setFeedback("");
      setRecipientInput("");
      setRecipientInputError("");
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

  async function handleEmail(recipientEmail?: string) {
    if (!token || isWorking) return;
    setStatus("working");
    setFeedback("");
    try {
      const result = await exportService.sendByEmail(token, recipientEmail);
      setStatus("success");
      setFeedback(result.message ?? "Summary emailed!");
    } catch (err) {
      console.error("[EXPORT] Failed to email summary:", err);
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : "Failed to send email. Please try again.");
    }
  }

  async function handleEmailTo() {
    const email = recipientInput.trim();
    if (!email) {
      setRecipientInputError("Please enter an email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setRecipientInputError("Please enter a valid email address.");
      return;
    }
    setRecipientInputError("");
    await handleEmail(email);
    if (status !== "error") setRecipientInput("");
  }

  async function handleShare() {
    if (!token || isWorking) return;
    setStatus("working");
    setFeedback("");
    try {
      const blob = await exportService.downloadPdf(token);
      const file = new File([blob], PDF_FILENAME, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: window.location.origin });
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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        {TriggerIcon}
        Share Progress
      </button>

      {isOpen && (
        <ShareActionModal
          title="Share Progress"
          onClose={() => setIsOpen(false)}
          isLoading={isWorking}
          feedback={feedback}
          feedbackIsError={status === "error"}
          extraContent={
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-[#3B344A]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#9E97AF]">
                Or send to another email
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={recipientInput}
                  onChange={(e) => { setRecipientInput(e.target.value); setRecipientInputError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleEmailTo(); }}
                  placeholder="Enter recipient email"
                  disabled={isWorking}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 dark:border-[#3B344A] dark:bg-[#1A1725] dark:text-[#F8F7FB] dark:placeholder:text-[#9E97AF]"
                />
                <button
                  type="button"
                  onClick={() => void handleEmailTo()}
                  disabled={isWorking}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#6C63FF] dark:hover:bg-[#5a52d5]"
                >
                  Send
                </button>
              </div>
              {recipientInputError && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{recipientInputError}</p>
              )}
            </div>
          }
          actions={[
            {
              label: "Download as PDF",
              icon: DownloadIcon,
              onClick: () => void handleDownload(),
              disabled: isWorking,
            },
            {
              label: "Email to myself",
              icon: EmailIcon,
              onClick: () => void handleEmail(),
              disabled: isWorking,
              variant: "primary",
            },
            {
              label: "Share to social media",
              icon: SocialShareIcon,
              onClick: () => void handleShare(),
              disabled: isWorking,
            },
          ]}
        />
      )}
    </>
  );
}

export default ShareMenu;
