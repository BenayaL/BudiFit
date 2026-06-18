import { useState } from "react";
import type { GeneratedWorkoutPlanSummary } from "../workout.models";
import { ChangeRequestModal } from "../ChangeRequestModal";
import { ModalPortal } from "../../../common/ModalPortal";

interface GeneratedWorkoutPlanCardProps {
  plan: GeneratedWorkoutPlanSummary;
  onSelect: (planId: string) => void;
  onComplete?: (planId: string) => void;
  onRemove?: (planId: string) => void;
  onReplace?: (planId: string, reason: string) => void;
  onRequestChange?: (planId: string, message: string) => Promise<void>;
  isActionInProgress?: boolean;
}

const CATEGORY_LABELS: Record<GeneratedWorkoutPlanSummary["category"], string> = {
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  endurance: "Endurance",
  general_fitness: "General Fitness",
  mobility: "Mobility",
  weight_loss: "Weight Loss",
};

const CATEGORY_STYLES: Record<GeneratedWorkoutPlanSummary["category"], string> = {
  strength: "bg-purple-100 text-purple-700",
  hypertrophy: "bg-rose-100 text-rose-700",
  endurance: "bg-blue-100 text-blue-700",
  general_fitness: "bg-emerald-100 text-emerald-700",
  mobility: "bg-amber-100 text-amber-700",
  weight_loss: "bg-orange-100 text-orange-700",
};

const DIFFICULTY_ACCENT = {
  easy:   { color: "#10B981", hover: "#059669" },
  medium: { color: "#F59E0B", hover: "#D97706" },
  hard:   { color: "#E11D48", hover: "#BE123C" },
  epic:   { color: "#1D4ED8", hover: "#1E40AF" },
} as const;

function getDifficultyAccent(difficulty: number) {
  if (difficulty <= 2) return DIFFICULTY_ACCENT.easy;
  if (difficulty === 3) return DIFFICULTY_ACCENT.medium;
  if (difficulty === 4) return DIFFICULTY_ACCENT.hard;
  return DIFFICULTY_ACCENT.epic;
}

function LockedPlanCard({ plan }: { plan: GeneratedWorkoutPlanSummary }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-orange-200 bg-orange-50 shadow-sm">
      <div className="h-2 bg-orange-400" />
      <div className="p-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
            Pending coach review
          </span>
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-slate-900">{plan.title}</h2>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{plan.description}</p>
        <div className="mt-4 rounded-2xl border border-orange-200 bg-white p-4">
          <p className="text-sm font-bold text-orange-800">Awaiting coach approval</p>
          <p className="mt-1 text-xs text-orange-700">
            Your coach is reviewing this plan. You'll be notified when it's approved.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {plan.durationWeeks} weeks
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {plan.workoutDaysPerWeek} days/week
          </span>
        </div>
      </div>
    </article>
  );
}

export function GeneratedWorkoutPlanCard({
  plan,
  onSelect,
  onComplete,
  onRemove,
  onReplace,
  onRequestChange,
  isActionInProgress,
}: GeneratedWorkoutPlanCardProps) {
  const [btnHover, setBtnHover] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  if (!plan.canViewDetails) {
    return <LockedPlanCard plan={plan} />;
  }

  const accent = getDifficultyAccent(plan.difficulty);
  const isCompleted = plan.status === "completed";
  const canRequestChange = plan.managedByCoach && plan.canViewDetails && plan.status === "active";
  const hasActions =
    plan.canComplete ||
    (!isCompleted && (plan.canRequestReplacement || plan.canRemove)) ||
    canRequestChange;

  return (
    <>
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="h-2" style={{ backgroundColor: accent.color }} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${CATEGORY_STYLES[plan.category]}`}>
            {CATEGORY_LABELS[plan.category]}
          </span>

          <div className="flex gap-1" aria-label={`Difficulty ${plan.difficulty} out of 5`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="h-1.5 w-5 rounded-full"
                style={{ backgroundColor: index < plan.difficulty ? accent.color : "#E2E8F0" }}
              />
            ))}
          </div>
        </div>

        {plan.status === "completed" && (
          <span className="mt-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            Completed
          </span>
        )}

        <h2 className="mt-5 text-xl font-extrabold text-slate-900">{plan.title}</h2>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{plan.description}</p>

        {plan.requiresProfessionalReview && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
            This plan requires professional review.
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {plan.durationWeeks} weeks
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {plan.workoutDaysPerWeek} days/week
          </span>
        </div>

        {plan.equipment.length > 0 && (
          <p className="mt-4 text-xs font-medium text-slate-500">
            Equipment: {plan.equipment.join(", ")}
          </p>
        )}

        <button
          type="button"
          onClick={() => onSelect(plan.id)}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          disabled={isActionInProgress}
          className="mt-6 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition disabled:opacity-50"
          style={{ backgroundColor: btnHover ? accent.hover : accent.color }}
        >
          View workout plan
        </button>

        {hasActions && (
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.canComplete && onComplete && (
              <button
                type="button"
                onClick={() => onComplete(plan.id)}
                disabled={isActionInProgress}
                className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
              >
                {isActionInProgress ? "..." : "Complete"}
              </button>
            )}

            {!isCompleted && plan.canRequestReplacement && onReplace && (
              <button
                type="button"
                onClick={() => setShowReplaceModal(true)}
                disabled={isActionInProgress}
                className="flex-1 rounded-2xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-100 disabled:opacity-50"
              >
                Replace
              </button>
            )}

            {!isCompleted && plan.canRemove && onRemove && (
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(true)}
                disabled={isActionInProgress}
                className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
              >
                Remove
              </button>
            )}

            {canRequestChange && onRequestChange && (
              plan.hasPendingChangeRequest ? (
                <span className="flex-1 rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 text-center text-xs font-bold text-orange-400">
                  Change requested
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowChangeModal(true)}
                  disabled={isActionInProgress}
                  className="flex-1 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
                >
                  Request change
                </button>
              )
            )}
          </div>
        )}
      </div>

    </article>

    {showRemoveConfirm && (
      <ModalPortal>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold text-slate-900">Remove plan?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This plan will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRemoveConfirm(false);
                  onRemove?.(plan.id);
                }}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
    )}

    {showChangeModal && onRequestChange && (
      <ModalPortal>
        <ChangeRequestModal
          planTitle={plan.title}
          isOpen={showChangeModal}
          onClose={() => setShowChangeModal(false)}
          onSubmit={(message) => onRequestChange(plan.id, message)}
        />
      </ModalPortal>
    )}

    {showReplaceModal && (
      <ModalPortal>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-extrabold text-slate-900">Why are you replacing?</h3>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReplaceModal(false);
                  onReplace?.(plan.id, "completed");
                }}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                I completed this plan
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplaceModal(false);
                  onReplace?.(plan.id, "not_suitable");
                }}
                className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
              >
                This plan doesn't suit me
              </button>
              <button
                type="button"
                onClick={() => setShowReplaceModal(false)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>
    )}
    </>
  );
}

export default GeneratedWorkoutPlanCard;
