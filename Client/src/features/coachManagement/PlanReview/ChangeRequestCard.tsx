import { useState } from "react";
import type { CoachChangeRequestDTO } from "../coach.models";
import { RejectChangeRequestModal } from "./RejectChangeRequestModal";

const MAX_PREVIEW = 300;

interface ChangeRequestCardProps {
  request: CoachChangeRequestDTO;
  onEditPlan: (planId: string, requestId: string) => void;
  onRejectRequest: (requestId: string) => Promise<void>;
}

export function ChangeRequestCard({
  request,
  onEditPlan,
  onRejectRequest,
}: ChangeRequestCardProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isLong = request.message.length > MAX_PREVIEW;
  const displayMessage =
    isLong && !expanded
      ? `${request.message.slice(0, MAX_PREVIEW).trimEnd()}…`
      : request.message;

  const formattedDate = new Date(request.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <article className="rounded-2xl border border-orange-100 bg-orange-50 p-5 dark:border-orange-800/40 dark:bg-orange-900/20">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-900 dark:text-[#F8F7FB]">{request.planTitle}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#9E97AF]">
              Trainee: <span className="font-semibold dark:text-[#C9C4D6]">{request.traineeName}</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-[#9E97AF]">Submitted: {formattedDate}</p>
          </div>
          <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            Pending
          </span>
        </div>

        {/* Message */}
        <blockquote className="mt-3 rounded-xl border-l-4 border-orange-300 bg-white px-3 py-2 text-sm italic text-slate-700 dark:border-orange-700 dark:bg-[#2A2436] dark:text-[#C9C4D6]">
          "{displayMessage}"
        </blockquote>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEditPlan(request.planId, request.id)}
            className="rounded-2xl bg-purple-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-purple-700"
          >
            Edit plan
          </button>
          <button
            type="button"
            onClick={() => setShowRejectModal(true)}
            className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 dark:border-red-800/40 dark:bg-[#2A2436] dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Reject request
          </button>
        </div>
      </article>

      {showRejectModal && (
        <RejectChangeRequestModal
          traineeName={request.traineeName}
          planTitle={request.planTitle}
          onConfirm={() => onRejectRequest(request.id)}
          onClose={() => setShowRejectModal(false)}
        />
      )}
    </>
  );
}
