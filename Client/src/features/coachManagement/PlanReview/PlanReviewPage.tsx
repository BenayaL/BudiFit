import { useState } from "react";
import { usePlanReview } from "./usePlanReview";
import type { CoachPlanDay, CoachPlanExercise } from "../coach.models";
import type { PlanReviewPageProps } from "./PlanReview.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";

function PlanReviewPage({ selectedPlanId, changeRequestId, onChangePage }: PlanReviewPageProps) {
  const { token } = useAuth();
  const { plan, isLoading, error, isSaving, saveChanges, approvePlan, deletePlan } =
    usePlanReview(selectedPlanId);

  const [saveError, setSaveError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resolveWarning, setResolveWarning] = useState("");
  const [editedDays, setEditedDays] = useState<CoachPlanDay[] | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading plan…</div>;

  if (!plan) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">No plan selected</h1>
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

  const days = editedDays ?? plan.days;

  function updateExercise(
    dayIdx: number,
    exIdx: number,
    field: keyof CoachPlanExercise,
    value: string | number
  ) {
    const next = days.map((d, di) => {
      if (di !== dayIdx) return d;
      return {
        ...d,
        exercises: d.exercises.map((ex, ei) => {
          if (ei !== exIdx) return ex;
          return { ...ex, [field]: value };
        }),
      };
    });
    setEditedDays(next);
  }

  async function handleSave() {
    setSaveError("");
    setSuccessMsg("");
    setResolveWarning("");
    const ok = await saveChanges({ days });
    if (!ok) {
      setSaveError("Failed to save changes.");
      return;
    }

    setEditedDays(null);

    // If editing was opened from a change request, mark it as resolved.
    if (changeRequestId && token) {
      try {
        await coachService.resolveChangeRequest(changeRequestId, plan!.id, token);
        setSuccessMsg("Changes saved and change request resolved.");
      } catch (err) {
        // Plan save already succeeded — warn but don't undo.
        setResolveWarning(
          `Changes saved, but the change request could not be marked as resolved: ${
            err instanceof Error ? err.message : "unknown error"
          }. You can retry by saving again or contact support.`
        );
      }
    } else {
      setSuccessMsg("Changes saved.");
    }
  }

  async function handleApprove() {
    setSaveError("");
    setSuccessMsg("");
    setResolveWarning("");
    const ok = await approvePlan();
    if (ok) {
      setSuccessMsg("Plan approved. The trainee can now access it.");
    } else {
      setSaveError("Failed to approve plan.");
    }
  }

  async function handleDelete() {
    setSaveError("");
    setSuccessMsg("");
    setResolveWarning("");
    const ok = await deletePlan();
    if (ok) {
      onChangePage("coach-plans");
    } else {
      setSaveError("Failed to delete plan.");
      setConfirmDelete(false);
    }
  }

  const isDirty = editedDays !== null;
  const isPending = plan.approvalStatus === "pending_review";

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      {/* Header */}
      <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
            {isPending ? "Plan review" : "Plan editor"}
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900">{plan.title}</h1>
          <p className="mt-2 text-slate-500">
            Trainee:{" "}
            <span className="font-bold text-slate-700">{plan.traineeName}</span>
            {" · "}
            {plan.durationWeeks} weeks · {plan.workoutDaysPerWeek} days/week
          </p>
          {changeRequestId && (
            <p className="mt-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 inline-block">
              Editing from a change request — saving will resolve it.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChangePage("coach-plans")}
          className="shrink-0 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Back to plans
        </button>
      </section>

      {/* Feedback banners */}
      {(saveError || error) && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {saveError || error}
        </div>
      )}
      {resolveWarning && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          {resolveWarning}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {successMsg}
        </div>
      )}

      {/* Plan description */}
      {plan.description && (
        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600 leading-relaxed">{plan.description}</p>
        </section>
      )}

      {/* Days editor */}
      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Weekly schedule</h2>
        {days.map((day, dayIdx) => (
          <div key={day.id || `day-${day.dayNumber}`} className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between p-5 text-left"
              onClick={() => setExpandedDay(expandedDay === dayIdx ? null : dayIdx)}
            >
              <div>
                <span className="text-sm font-bold uppercase tracking-wide text-purple-600">
                  Day {day.dayNumber}
                </span>
                <h3 className="mt-1 font-extrabold text-slate-900">{day.title}</h3>
                {day.restDay ? (
                  <span className="text-sm text-slate-500">Rest day</span>
                ) : (
                  <span className="text-sm text-slate-500">
                    {day.exercises.length} exercises · {day.durationMinutes} min
                  </span>
                )}
              </div>
              <span className="text-slate-400">{expandedDay === dayIdx ? "▲" : "▼"}</span>
            </button>

            {expandedDay === dayIdx && !day.restDay && (
              <div className="border-t border-slate-100 p-5">
                <div className="space-y-4">
                  {day.exercises.map((ex, exIdx) => (
                    <div
                      key={ex.id || `ex-${exIdx}`}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-500">
                            Exercise name
                          </label>
                          <input
                            type="text"
                            value={ex.name}
                            onChange={(e) => updateExercise(dayIdx, exIdx, "name", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-500">
                            Equipment
                          </label>
                          <input
                            type="text"
                            value={ex.equipment}
                            onChange={(e) => updateExercise(dayIdx, exIdx, "equipment", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-500">
                            Sets
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={ex.sets ?? ""}
                            onChange={(e) => updateExercise(dayIdx, exIdx, "sets", Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-bold text-slate-500">
                            Reps / duration
                          </label>
                          <input
                            type="text"
                            value={ex.reps ?? ""}
                            onChange={(e) => updateExercise(dayIdx, exIdx, "reps", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-400 focus:outline-none"
                          />
                        </div>
                      </div>
                      {ex.notes && (
                        <p className="mt-2 text-xs text-slate-500 italic">{ex.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Action bar */}
      <section className="mt-8 flex flex-wrap gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {isDirty && (
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
            <span className="text-sm font-medium text-red-700">Are you sure?</span>
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
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default PlanReviewPage;
