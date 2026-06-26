import { useState, useEffect, useRef } from "react";
import { usePlanReview } from "./usePlanReview";
import type { PlanReviewPageProps } from "./PlanReview.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";
import type {
  EditablePlan,
  EditablePlanDay,
  EditablePlanExercise,
  PlanEditorValidationErrors,
} from "./planEditor.types";
import type { CoachPlanUpdateBody } from "../coach.models";
import {
  normalizePlan,
  parseEquipment,
  toApiDays,
  validateEditablePlan,
  hasValidationErrors,
  makeNewDay,
  removeDay,
  makeNewExercise,
  removeExercise,
  duplicateExercise,
  moveExercise,
} from "./planEditor.utils";
import { PlanDetailsEditor } from "./PlanDetailsEditor";
import { PlanDayEditor } from "./PlanDayEditor";
import { DeleteEditorItemModal } from "./DeleteEditorItemModal";
import { SuccessModal } from "./SuccessModal";

interface DeleteTarget {
  type: "day" | "exercise";
  dayClientId: string;
  exerciseClientId?: string;
}

function PlanReviewPage({
  selectedPlanId,
  changeRequestId,
  onChangePage,
}: PlanReviewPageProps) {
  const { token } = useAuth();
  const { plan, isLoading, error, isSaving, saveChanges, approvePlan, deletePlan } =
    usePlanReview(selectedPlanId);

  // ─── Editor state ──────────────────────────────────────────────────────────
  const [editablePlan, setEditablePlan] = useState<EditablePlan | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] =
    useState<PlanEditorValidationErrors | null>(null);

  // ─── Feedback ─────────────────────────────────────────────────────────────
  const [saveError, setSaveError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resolveWarning, setResolveWarning] = useState("");
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

  // ─── UI state ──────────────────────────────────────────────────────────────
  const [expandedDayNumber, setExpandedDayNumber] = useState<number | null>(1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  // Bumped to force PlanDetailsEditor to remount with fresh local state after
  // a discard or a save (so the equipment string input resets correctly).
  const [resetKey, setResetKey] = useState(0);

  // Track plan id+version to avoid reinitializing on unrelated renders.
  const lastSyncRef = useRef<string | null>(null);

  // ─── Initialize editable plan from server ─────────────────────────────────
  useEffect(() => {
    if (!plan) return;
    const syncKey = `${plan.id}_${plan.version}`;
    if (lastSyncRef.current === syncKey) return;
    lastSyncRef.current = syncKey;

    const normalized = normalizePlan(plan);
    setEditablePlan(normalized);
    setIsDirty(false);
    setValidationErrors(null);
    setResetKey((k) => k + 1);
    // Auto-expand the first day on initial load only.
    setExpandedDayNumber((prev) =>
      prev === null ? (normalized.days[0]?.dayNumber ?? null) : prev
    );
  }, [plan]);

  // ─── Generic plan update helper ───────────────────────────────────────────
  function updatePlan(updates: Partial<EditablePlan>) {
    setEditablePlan((prev) => (prev ? { ...prev, ...updates } : prev));
    setIsDirty(true);
    setValidationErrors(null);
  }

  function updateDay(dayClientId: string, updates: Partial<EditablePlanDay>) {
    setEditablePlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) =>
          d.clientId === dayClientId ? { ...d, ...updates } : d
        ),
      };
    });
    setIsDirty(true);
    setValidationErrors(null);
  }

  function updateExercise(
    dayClientId: string,
    exerciseClientId: string,
    updates: Partial<EditablePlanExercise>
  ) {
    setEditablePlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) => {
          if (d.clientId !== dayClientId) return d;
          return {
            ...d,
            exercises: d.exercises.map((e) =>
              e.clientId === exerciseClientId ? { ...e, ...updates } : e
            ),
          };
        }),
      };
    });
    setIsDirty(true);
    setValidationErrors(null);
  }

  // ─── Day operations ────────────────────────────────────────────────────────
  function handleAddDay() {
    if (!editablePlan || editablePlan.days.length >= 7) return;
    const newDay = makeNewDay(editablePlan.days);
    updatePlan({ days: [...editablePlan.days, newDay] });
    setExpandedDayNumber(newDay.dayNumber);
  }

  function handleRemoveDay(dayClientId: string) {
    setDeleteTarget({ type: "day", dayClientId });
  }

  function confirmRemoveDay() {
    if (!editablePlan || !deleteTarget || deleteTarget.type !== "day") return;
    const removed = editablePlan.days.find(
      (d) => d.clientId === deleteTarget.dayClientId
    );
    if (removed && expandedDayNumber === removed.dayNumber) {
      setExpandedDayNumber(null);
    }
    updatePlan({ days: removeDay(editablePlan.days, deleteTarget.dayClientId) });
    setDeleteTarget(null);
  }

  // ─── Exercise operations ───────────────────────────────────────────────────
  function handleAddExercise(dayClientId: string) {
    if (!editablePlan) return;
    const day = editablePlan.days.find((d) => d.clientId === dayClientId);
    if (!day) return;
    updateDay(dayClientId, {
      exercises: [...day.exercises, makeNewExercise(day.exercises)],
    });
  }

  function handleRemoveExercise(dayClientId: string, exerciseClientId: string) {
    setDeleteTarget({ type: "exercise", dayClientId, exerciseClientId });
  }

  function confirmRemoveExercise() {
    if (
      !editablePlan ||
      !deleteTarget ||
      deleteTarget.type !== "exercise" ||
      !deleteTarget.exerciseClientId
    )
      return;
    const { dayClientId, exerciseClientId } = deleteTarget;
    const day = editablePlan.days.find((d) => d.clientId === dayClientId);
    if (!day) return;
    updateDay(dayClientId, {
      exercises: removeExercise(day.exercises, exerciseClientId),
    });
    setDeleteTarget(null);
  }

  function handleDuplicateExercise(
    dayClientId: string,
    exerciseClientId: string
  ) {
    if (!editablePlan) return;
    const day = editablePlan.days.find((d) => d.clientId === dayClientId);
    if (!day) return;
    updateDay(dayClientId, {
      exercises: duplicateExercise(day.exercises, exerciseClientId),
    });
  }

  function handleMoveExercise(
    dayClientId: string,
    exerciseClientId: string,
    direction: "up" | "down"
  ) {
    if (!editablePlan) return;
    const day = editablePlan.days.find((d) => d.clientId === dayClientId);
    if (!day) return;
    updateDay(dayClientId, {
      exercises: moveExercise(day.exercises, exerciseClientId, direction),
    });
  }

  // ─── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!editablePlan) return;
    setSaveError("");
    setSuccessMsg("");
    setResolveWarning("");

    const errors = validateEditablePlan(editablePlan);
    if (hasValidationErrors(errors)) {
      setValidationErrors(errors);
      return;
    }

    const body: CoachPlanUpdateBody = {
      title: editablePlan.title,
      description: editablePlan.description,
      category: editablePlan.category,
      difficulty: editablePlan.difficulty,
      durationWeeks: editablePlan.durationWeeks,
      workoutDaysPerWeek: editablePlan.workoutDaysPerWeek,
      equipment: parseEquipment(editablePlan.equipmentStr),
      days: toApiDays(editablePlan.days),
    };

    const updated = await saveChanges(body);
    if (!updated) {
      // saveChanges already called setError with the server's message.
      // It will appear in the error banner via the `error` prop from usePlanReview.
      return;
    }

    // Prevent the useEffect from re-syncing (we're handling it here).
    lastSyncRef.current = `${updated.id}_${updated.version}`;
    const normalized = normalizePlan(updated);
    setEditablePlan(normalized);
    setResetKey((k) => k + 1);
    setIsDirty(false);
    setValidationErrors(null);

    if (changeRequestId && token) {
      try {
        await coachService.resolveChangeRequest(changeRequestId, updated.id, token);
        setSuccessMsg("Changes saved and change request resolved.");
      } catch (err) {
        setResolveWarning(
          `Changes saved, but the change request could not be resolved: ${
            err instanceof Error ? err.message : "unknown error"
          }. Retry by saving again or contact support.`
        );
      }
    } else {
      setSuccessMsg("Changes saved.");
    }
  }

  // ─── Approve ───────────────────────────────────────────────────────────────
  async function handleApprove() {
    setSaveError("");
    setSuccessMsg("");
    setResolveWarning("");
    const ok = await approvePlan();
    if (ok) {
      setSuccessModal({
        title: "Plan approved successfully",
        message: "The trainee can now access this workout plan.",
      });
    } else {
      setSaveError("Failed to approve plan.");
    }
  }

  // ─── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    setSaveError("");
    const ok = await deletePlan();
    if (ok) {
      onChangePage("coach-plans");
    } else {
      setSaveError("Failed to delete plan.");
      setConfirmDelete(false);
    }
  }

  // ─── Discard ───────────────────────────────────────────────────────────────
  function handleDiscard() {
    if (!plan) return;
    lastSyncRef.current = `${plan.id}_${plan.version}`;
    const normalized = normalizePlan(plan);
    setEditablePlan(normalized);
    setResetKey((k) => k + 1);
    setIsDirty(false);
    setValidationErrors(null);
    setSaveError("");
    setSuccessMsg("");
    setResolveWarning("");
  }

  // ─── Early returns ─────────────────────────────────────────────────────────
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 dark:text-[#9E97AF]">Loading plan…</div>;
  }

  if (!plan || !editablePlan) {
    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">
            No plan selected
          </h1>
          {error && <p className="mt-2 text-red-600">{error}</p>}
          <button
            type="button"
            onClick={() => onChangePage("coach-plans")}
            className="mt-6 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
          >
            Go to plans
          </button>
        </div>
      </main>
    );
  }

  const isPending = plan.approvalStatus === "pending_review";
  const emptyErrors: PlanEditorValidationErrors = { dayErrors: {} };
  const activeErrors = validationErrors ?? emptyErrors;

  // Resolve delete modal label
  const deleteModalDay = deleteTarget
    ? editablePlan.days.find((d) => d.clientId === deleteTarget.dayClientId)
    : null;
  const deleteModalLabel =
    deleteTarget?.type === "day"
      ? `Day ${deleteModalDay?.dayNumber ?? ""} — ${
          deleteModalDay?.title || "Untitled"
        }`
      : deleteModalDay?.exercises.find(
            (e) => e.clientId === deleteTarget?.exerciseClientId
          )?.name || "this exercise";

  return (
    <>
      <main className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 py-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
              {isPending ? "Plan review" : "Plan editor"}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-[#9E97AF]">
              Trainee:{" "}
              <span className="font-bold text-slate-700 dark:text-[#C9C4D6]">
                {plan.traineeName}
              </span>
              {" · "}v{plan.version}
              {isPending && (
                <span className="ml-2 inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                  Pending review
                </span>
              )}
            </p>
            {changeRequestId && (
              <p className="mt-2 inline-block rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                Editing from a change request — saving will resolve it.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChangePage("coach-plans")}
            className="shrink-0 self-start rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
          >
            ← Back to plans
          </button>
        </section>

        {/* ── Feedback banners ────────────────────────────────────────────── */}
        {(saveError || error) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {saveError || error}
          </div>
        )}
        {resolveWarning && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            {resolveWarning}
          </div>
        )}
        {successMsg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {successMsg}
          </div>
        )}

        {/* ── Plan details editor ──────────────────────────────────────────── */}
        <PlanDetailsEditor
          key={resetKey}
          plan={editablePlan}
          errors={activeErrors}
          onChange={updatePlan}
        />

        {/* ── Weekly schedule ──────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">
              Weekly schedule
            </h2>
            {activeErrors.days && (
              <p className="text-sm font-medium text-red-600">
                {activeErrors.days}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {editablePlan.days.map((day) => (
              <PlanDayEditor
                key={day.clientId}
                day={day}
                errors={activeErrors.dayErrors[day.clientId]}
                isExpanded={expandedDayNumber === day.dayNumber}
                canRemove={editablePlan.days.length > 1}
                onToggleExpand={() =>
                  setExpandedDayNumber(
                    expandedDayNumber === day.dayNumber ? null : day.dayNumber
                  )
                }
                onChange={(updates) => updateDay(day.clientId, updates)}
                onRemove={() => handleRemoveDay(day.clientId)}
                onAddExercise={() => handleAddExercise(day.clientId)}
                onExerciseChange={(exId, updates) =>
                  updateExercise(day.clientId, exId, updates)
                }
                onExerciseRemove={(exId) =>
                  handleRemoveExercise(day.clientId, exId)
                }
                onExerciseDuplicate={(exId) =>
                  handleDuplicateExercise(day.clientId, exId)
                }
                onExerciseMoveUp={(exId) =>
                  handleMoveExercise(day.clientId, exId, "up")
                }
                onExerciseMoveDown={(exId) =>
                  handleMoveExercise(day.clientId, exId, "down")
                }
              />
            ))}
          </div>

          {editablePlan.days.length < 7 && (
            <button
              type="button"
              onClick={handleAddDay}
              className="mt-4 w-full rounded-3xl border border-dashed border-purple-300 bg-white py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-50 dark:border-purple-700 dark:bg-[#211D2B] dark:text-purple-300 dark:hover:bg-purple-900/20"
            >
              + Add day
            </button>
          )}
        </section>

        {/* ── Action bar ───────────────────────────────────────────────────── */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
          <div className="flex flex-wrap items-center gap-3">
            {isDirty && (
              <>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                  className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSaving
                    ? "Saving…"
                    : changeRequestId
                    ? "Save & resolve request"
                    : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={isSaving}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
                >
                  Discard changes
                </button>
              </>
            )}

            {isPending && !isDirty && (
              <button
                type="button"
                onClick={() => void handleApprove()}
                disabled={isSaving}
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSaving ? "Approving…" : "Approve plan"}
              </button>
            )}

            <div className="ml-auto">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  Delete plan
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    Are you sure?
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={isSaving}
                    className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSaving ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-[#3B344A] dark:text-[#C9C4D6] dark:hover:bg-[#2A2436]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── Delete confirmation modal ────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteEditorItemModal
          itemType={deleteTarget.type}
          itemName={deleteModalLabel}
          onConfirm={
            deleteTarget.type === "day"
              ? confirmRemoveDay
              : confirmRemoveExercise
          }
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Success modal ───────────────────────────────────────────────── */}
      {successModal && (
        <SuccessModal
          title={successModal.title}
          message={successModal.message}
          primaryLabel="Back to plans"
          onPrimary={() => onChangePage("coach-plans")}
          onClose={() => setSuccessModal(null)}
        />
      )}
    </>
  );
}

export default PlanReviewPage;
