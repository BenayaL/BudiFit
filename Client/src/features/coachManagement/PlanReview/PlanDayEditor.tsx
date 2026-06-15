import type {
  EditablePlanDay,
  EditablePlanExercise,
  DayValidationErrors,
} from "./planEditor.types";
import { PlanExerciseEditor } from "./PlanExerciseEditor";

interface PlanDayEditorProps {
  day: EditablePlanDay;
  errors?: DayValidationErrors;
  isExpanded: boolean;
  canRemove: boolean;
  onToggleExpand: () => void;
  onChange: (updates: Partial<EditablePlanDay>) => void;
  onRemove: () => void;
  onAddExercise: () => void;
  onExerciseChange: (exerciseClientId: string, updates: Partial<EditablePlanExercise>) => void;
  onExerciseRemove: (exerciseClientId: string) => void;
  onExerciseDuplicate: (exerciseClientId: string) => void;
  onExerciseMoveUp: (exerciseClientId: string) => void;
  onExerciseMoveDown: (exerciseClientId: string) => void;
}

const inp =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-200";
const lbl = "mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500";
const errTxt = "mt-1 text-xs text-red-600";

export function PlanDayEditor({
  day,
  errors,
  isExpanded,
  canRemove,
  onToggleExpand,
  onChange,
  onRemove,
  onAddExercise,
  onExerciseChange,
  onExerciseRemove,
  onExerciseDuplicate,
  onExerciseMoveUp,
  onExerciseMoveDown,
}: PlanDayEditorProps) {
  const hasErrors =
    errors &&
    (errors.title ||
      errors.durationMinutes ||
      errors.exercises ||
      Object.keys(errors.exerciseErrors).length > 0);

  return (
    <div
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
        hasErrors ? "border-red-200" : "border-slate-200"
      }`}
    >
      {/* ── Accordion header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-4 sm:p-5">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={onToggleExpand}
        >
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold uppercase tracking-wide text-purple-600">
              Day {day.dayNumber}
            </span>
            <p className="mt-0.5 truncate font-extrabold text-slate-900">
              {day.title || (
                <span className="italic text-slate-400">Untitled</span>
              )}
            </p>
            <p className="text-xs text-slate-500">
              {day.restDay
                ? "Rest day"
                : `${day.exercises.length} exercise${day.exercises.length !== 1 ? "s" : ""} · ${day.durationMinutes} min`}
            </p>
          </div>
          <span className="shrink-0 text-sm text-slate-400">
            {isExpanded ? "▲" : "▼"}
          </span>
        </button>

        {canRemove && (
          <button
            type="button"
            title="Remove this day"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="shrink-0 rounded-xl border border-red-200 bg-white px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>

      {/* ── Expanded editor ──────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="space-y-4 border-t border-slate-100 p-5">
          {/* Title */}
          <div>
            <label className={lbl}>Day title</label>
            <input
              type="text"
              value={day.title}
              onChange={(e) => onChange({ title: e.target.value })}
              maxLength={120}
              placeholder="e.g. Upper Body Strength"
              className={`${inp} ${errors?.title ? "border-red-300" : ""}`}
            />
            {errors?.title && <p className={errTxt}>{errors.title}</p>}
          </div>

          {/* Rest day toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-700">Rest day</span>
            <button
              type="button"
              onClick={() =>
                onChange({
                  restDay: !day.restDay,
                  durationMinutes: day.restDay ? 45 : 0,
                  exercises: day.restDay ? day.exercises : [],
                })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                day.restDay ? "bg-purple-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  day.restDay ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Duration — workout days only */}
          {!day.restDay && (
            <div>
              <label className={lbl}>Duration (minutes)</label>
              <input
                type="number"
                min={1}
                max={300}
                value={day.durationMinutes || ""}
                onChange={(e) =>
                  onChange({
                    durationMinutes: Math.round(Number(e.target.value)) || 0,
                  })
                }
                placeholder="e.g. 60"
                className={`${inp} ${errors?.durationMinutes ? "border-red-300" : ""}`}
              />
              {errors?.durationMinutes && (
                <p className={errTxt}>{errors.durationMinutes}</p>
              )}
            </div>
          )}

          {/* Exercises — workout days only */}
          {!day.restDay && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Exercises
              </h3>

              {errors?.exercises && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {errors.exercises}
                </p>
              )}

              {day.exercises.length === 0 && !errors?.exercises && (
                <p className="text-sm text-slate-400">
                  No exercises yet. Add one below.
                </p>
              )}

              {day.exercises.map((ex, idx) => (
                <PlanExerciseEditor
                  key={ex.clientId}
                  exercise={ex}
                  errors={errors?.exerciseErrors[ex.clientId]}
                  isFirst={idx === 0}
                  isLast={idx === day.exercises.length - 1}
                  onChange={(updates) => onExerciseChange(ex.clientId, updates)}
                  onRemove={() => onExerciseRemove(ex.clientId)}
                  onDuplicate={() => onExerciseDuplicate(ex.clientId)}
                  onMoveUp={() => onExerciseMoveUp(ex.clientId)}
                  onMoveDown={() => onExerciseMoveDown(ex.clientId)}
                />
              ))}

              <button
                type="button"
                onClick={onAddExercise}
                className="w-full rounded-2xl border border-dashed border-purple-300 bg-purple-50 py-2.5 text-sm font-bold text-purple-700 transition hover:bg-purple-100"
              >
                + Add exercise
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
