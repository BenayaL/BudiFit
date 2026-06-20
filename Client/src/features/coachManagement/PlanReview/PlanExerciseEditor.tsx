import type { EditablePlanExercise, ExerciseValidationErrors } from "./planEditor.types";

interface PlanExerciseEditorProps {
  exercise: EditablePlanExercise;
  errors?: ExerciseValidationErrors;
  isFirst: boolean;
  isLast: boolean;
  onChange: (updates: Partial<EditablePlanExercise>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const inp =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-200 dark:border-[#3B344A] dark:bg-[#18161F] dark:text-[#C9C4D6] dark:placeholder:text-[#9E97AF] dark:focus:border-purple-600 dark:focus:ring-purple-900/30";
const inpErr = "border-red-300";
const lbl = "mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#9E97AF]";
const err = "mt-1 text-xs text-red-600";

export function PlanExerciseEditor({
  exercise,
  errors,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: PlanExerciseEditorProps) {
  const hasErrors = errors && (errors.name || errors.equipment || errors.execution);

  return (
    <div
      className={`rounded-2xl border p-4 ${
        hasErrors
          ? "border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-900/20"
          : "border-slate-200 bg-slate-50 dark:border-[#3B344A] dark:bg-[#2A2436]"
      }`}
    >
      {/* Header row: order label + action buttons */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400">
          Exercise {exercise.order}
        </span>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            title="Move up"
            disabled={isFirst}
            onClick={onMoveUp}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-[#3B344A] dark:bg-[#18161F] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
          >
            ↑
          </button>
          <button
            type="button"
            title="Move down"
            disabled={isLast}
            onClick={onMoveDown}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-[#3B344A] dark:bg-[#18161F] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-[#3B344A] dark:bg-[#18161F] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800/40 dark:bg-[#18161F] dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className={lbl}>Exercise name</label>
          <input
            type="text"
            value={exercise.name}
            onChange={(e) => onChange({ name: e.target.value })}
            maxLength={120}
            placeholder="e.g. Barbell Squat"
            className={`${inp} ${errors?.name ? inpErr : ""}`}
          />
          {errors?.name && <p className={err}>{errors.name}</p>}
        </div>

        {/* Equipment */}
        <div>
          <label className={lbl}>Equipment</label>
          <input
            type="text"
            value={exercise.equipment}
            onChange={(e) => onChange({ equipment: e.target.value })}
            maxLength={100}
            placeholder="e.g. Barbell"
            className={`${inp} ${errors?.equipment ? inpErr : ""}`}
          />
          {errors?.equipment && <p className={err}>{errors.equipment}</p>}
        </div>

        {/* Sets */}
        <div>
          <label className={lbl}>Sets</label>
          <input
            type="number"
            min={1}
            max={20}
            value={exercise.sets ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ sets: v === "" ? undefined : Math.round(Number(v)) });
            }}
            placeholder="e.g. 3"
            className={inp}
          />
        </div>

        {/* Reps */}
        <div>
          <label className={lbl}>Reps</label>
          <input
            type="text"
            value={exercise.reps ?? ""}
            onChange={(e) => onChange({ reps: e.target.value || undefined })}
            maxLength={40}
            placeholder="e.g. 8–10 or AMRAP"
            className={inp}
          />
        </div>

        {/* Duration */}
        <div>
          <label className={lbl}>Duration (seconds)</label>
          <input
            type="number"
            min={0}
            max={7200}
            value={exercise.durationSec ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ durationSec: v === "" ? undefined : Math.round(Number(v)) });
            }}
            placeholder="e.g. 30"
            className={inp}
          />
        </div>

        {/* Rest */}
        <div>
          <label className={lbl}>Rest (seconds)</label>
          <input
            type="number"
            min={0}
            max={1800}
            value={exercise.restSec ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ restSec: v === "" ? undefined : Math.round(Number(v)) });
            }}
            placeholder="e.g. 60"
            className={inp}
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className={lbl}>
            Notes{" "}
            <span className="font-normal text-slate-400 dark:text-[#9E97AF]">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={exercise.notes ?? ""}
            onChange={(e) => onChange({ notes: e.target.value || undefined })}
            maxLength={500}
            placeholder="Coaching notes…"
            className={`${inp} resize-none`}
          />
        </div>
      </div>

      {/* Cross-field execution error */}
      {errors?.execution && (
        <p className={`${err} mt-2`}>{errors.execution}</p>
      )}
    </div>
  );
}
