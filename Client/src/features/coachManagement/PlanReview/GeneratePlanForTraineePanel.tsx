import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../../app/AuthContext";
import { useTraineeList } from "../TraineeList/useTraineeList";
import { coachService } from "../coachService";
import type { CoachPlan } from "../coach.models";

interface GeneratePlanForTraineePanelProps {
  plans: CoachPlan[];
  onReviewPlan: (planId: string) => void;
}

const splitCsv = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// Statuses that mean a plan is still current (not finished/discarded).
// "not_started" and "in_progress" are included for forward-compatibility
// even though CoachPlan currently only produces "draft" and "active".
const BLOCKING_STATUSES = new Set([
  "draft",
  "active",
  "not_started",
  "in_progress",
]);

export function GeneratePlanForTraineePanel({
  plans,
  onReviewPlan,
}: GeneratePlanForTraineePanelProps) {
  const { token } = useAuth();
  const {
    trainees,
    isLoading: traineesLoading,
    error: traineesError,
  } = useTraineeList();

  const [selectedTraineeId, setSelectedTraineeId] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [focusAreas, setFocusAreas] = useState("");
  const [excludedExercises, setExcludedExercises] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  // Build a Set of traineeIds that already have a current plan so we
  // avoid re-scanning `plans` inside every render and JSX expression.
  const blockedTraineeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const plan of plans) {
      const isCurrent =
        BLOCKING_STATUSES.has(plan.status) ||
        plan.approvalStatus === "pending_review";
      if (isCurrent) ids.add(plan.traineeId);
    }
    return ids;
  }, [plans]);

  // If the currently selected trainee becomes blocked (e.g. a plan was
  // approved or a pending draft appeared since the page loaded), clear
  // the selection so the coach cannot accidentally submit.
  useEffect(() => {
    if (selectedTraineeId && blockedTraineeIds.has(selectedTraineeId)) {
      setSelectedTraineeId("");
      setGenerationError("");
    }
  }, [selectedTraineeId, blockedTraineeIds]);

  const selectedTrainee =
    trainees.find((t) => t.userId === selectedTraineeId) ?? null;

  const isBlocked =
    selectedTraineeId !== "" && blockedTraineeIds.has(selectedTraineeId);

  const allTraineesBlocked =
    !traineesLoading &&
    !traineesError &&
    trainees.length > 0 &&
    trainees.every((t) => blockedTraineeIds.has(t.userId));

  const isButtonDisabled =
    !selectedTraineeId || isGenerating || traineesLoading || isBlocked;

  async function handleGenerate() {
    if (!token || !selectedTraineeId || isGenerating) return;

    // Defensive re-check in case the disabled state was bypassed.
    if (blockedTraineeIds.has(selectedTraineeId)) {
      setGenerationError("This trainee already has a current workout plan.");
      return;
    }

    setIsGenerating(true);
    setGenerationError("");
    try {
      const generatedPlan = await coachService.generatePlanForTrainee(
        selectedTraineeId,
        {
          notes: coachNotes.trim() || undefined,
          focusAreas: focusAreas.trim() ? splitCsv(focusAreas) : undefined,
          excludedExercises: excludedExercises.trim()
            ? splitCsv(excludedExercises)
            : undefined,
        },
        token
      );
      onReviewPlan(generatedPlan.id);
    } catch (err) {
      console.error("[COACH] Failed to generate plan:", err);
      setGenerationError(
        err instanceof Error ? err.message : "Failed to generate plan"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="w-full rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
      {/* Trainee load error — inline, does not replace the page */}
      {traineesError && (
        <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {traineesError}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* ── Left column ── */}
        <div className="space-y-4">
          {/* Trainee selector */}
          <div>
            <label
              htmlFor="trainee-select"
              className="block text-xs font-bold uppercase tracking-wide text-slate-600"
            >
              Trainee
            </label>
            <select
              id="trainee-select"
              value={selectedTraineeId}
              onChange={(e) => {
                setSelectedTraineeId(e.target.value);
                setGenerationError("");
              }}
              disabled={traineesLoading || isGenerating}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
            >
              <option value="">
                {traineesLoading ? "Loading trainees…" : "Select a trainee"}
              </option>
              {trainees.map((trainee) => {
                const blocked = blockedTraineeIds.has(trainee.userId);
                return (
                  <option
                    key={trainee.userId}
                    value={trainee.userId}
                    disabled={blocked}
                  >
                    {trainee.firstName} {trainee.lastName} —{" "}
                    {blocked ? "Already has a current plan" : trainee.level}
                  </option>
                );
              })}
            </select>

            {!traineesLoading && !traineesError && trainees.length === 0 && (
              <p className="mt-2 text-sm text-slate-400">
                No connected trainees are available.
              </p>
            )}

            {allTraineesBlocked && (
              <p className="mt-2 text-sm text-amber-600">
                All connected trainees already have a current workout plan.
              </p>
            )}
          </div>

          {/* Selected trainee summary */}
          {selectedTrainee && (
            <div className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3">
              <p className="text-sm font-bold text-slate-900">
                {selectedTrainee.firstName} {selectedTrainee.lastName}
              </p>
              <p className="mt-0.5 text-xs capitalize text-slate-500">
                {selectedTrainee.level} ·{" "}
                {selectedTrainee.status.replace("_", " ")}
              </p>
              {selectedTrainee.goals.length > 0 && (
                <p className="mt-1.5 text-xs text-slate-600">
                  Goals: {selectedTrainee.goals.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Current-plan warning */}
          {isBlocked && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-700">
              This trainee already has a current workout plan.
            </p>
          )}

          {/* Coach notes */}
          <div>
            <label
              htmlFor="coach-notes"
              className="block text-xs font-bold uppercase tracking-wide text-slate-600"
            >
              Coach notes
            </label>
            <textarea
              id="coach-notes"
              rows={3}
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              disabled={isGenerating}
              placeholder="Any specific instructions for the AI…"
              className="mt-1 w-full resize-none rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
            />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="focus-areas"
              className="block text-xs font-bold uppercase tracking-wide text-slate-600"
            >
              Focus areas{" "}
              <span className="font-normal text-slate-400">
                (comma-separated)
              </span>
            </label>
            <input
              id="focus-areas"
              type="text"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              disabled={isGenerating}
              placeholder="e.g. upper body, core"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="excluded-exercises"
              className="block text-xs font-bold uppercase tracking-wide text-slate-600"
            >
              Exercises to avoid{" "}
              <span className="font-normal text-slate-400">
                (comma-separated)
              </span>
            </label>
            <input
              id="excluded-exercises"
              type="text"
              value={excludedExercises}
              onChange={(e) => setExcludedExercises(e.target.value)}
              disabled={isGenerating}
              placeholder="e.g. burpees, deadlifts"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
            />
          </div>

          {/* Generation error */}
          {generationError && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {generationError}
            </p>
          )}

          {/* Generate button — pushed to bottom of right column */}
          <div className="mt-auto">
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={isButtonDisabled}
              className="w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? "Generating plan…" : "Generate plan with AI"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
