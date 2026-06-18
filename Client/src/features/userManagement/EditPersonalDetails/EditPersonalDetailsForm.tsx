import type { FitnessLevel, Gender, Goal, Equipment, MedicalCondition, PreferredWorkoutTime, SessionDurationMinutes } from "../user.models";
import {
  FITNESS_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  EQUIPMENT_OPTIONS,
  MEDICAL_CONDITION_OPTIONS,
  GENDER_OPTIONS,
  PREFERRED_TIME_OPTIONS,
  SESSION_DURATION_OPTIONS,
  WEEKLY_WORKOUT_OPTIONS,
} from "../Onboarding/onboarding.constants";
import { useEditPersonalDetails } from "./useEditPersonalDetails";

interface EditPersonalDetailsFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15";

const sectionClass =
  "rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm";

const sectionTitleClass = "text-base font-extrabold text-slate-900";

function ToggleButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-4 py-2 text-sm font-semibold transition",
        selected
          ? "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20"
          : "border-slate-200 bg-white text-slate-600 hover:border-purple-300",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function EditPersonalDetailsForm({
  onSaved,
  onCancel,
}: EditPersonalDetailsFormProps) {
  const {
    form,
    setForm,
    isLoading,
    isSaving,
    loadError,
    saveError,
    success,
    toggleGoal,
    toggleEquipment,
    toggleMedicalCondition,
    handleSubmit,
  } = useEditPersonalDetails(onSaved);

  if (isLoading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-[24px] border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">{loadError}</p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 text-sm font-bold text-red-600 underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Edit personal details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Updates apply to future workout plan generation. Existing plans are not affected.
          </p>
        </div>
      </div>

      {/* ── Personal Details ─────────────────────────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Personal details</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Age */}
          <div>
            <label htmlFor="edit-age" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Age <span className="text-purple-600">*</span>
            </label>
            <input
              id="edit-age"
              type="number"
              min={10}
              max={99}
              value={form.age}
              onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
              placeholder="e.g. 28"
              className={inputClass}
            />
          </div>

          {/* Gender */}
          <div>
            <p className="mb-1.5 text-sm font-semibold text-slate-700">Gender</p>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map(({ value, label }) => (
                <ToggleButton
                  key={value}
                  selected={form.gender === value}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      gender: prev.gender === value ? "" : (value as Gender),
                    }))
                  }
                >
                  {label}
                </ToggleButton>
              ))}
            </div>
          </div>

          {/* Height */}
          <div>
            <label htmlFor="edit-height" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Height <span className="text-slate-400 font-normal">(cm, optional)</span>
            </label>
            <input
              id="edit-height"
              type="number"
              min={100}
              max={250}
              value={form.height}
              onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
              placeholder="e.g. 175"
              className={inputClass}
            />
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="edit-weight" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Weight <span className="text-slate-400 font-normal">(kg, optional)</span>
            </label>
            <input
              id="edit-weight"
              type="number"
              min={30}
              max={300}
              value={form.weight}
              onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
              placeholder="e.g. 70"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ── Training Preferences ──────────────────────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Training preferences</h3>

        {/* Fitness level */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Fitness level <span className="text-purple-600">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {FITNESS_LEVEL_OPTIONS.map(({ value, label, emoji }) => (
              <ToggleButton
                key={value}
                selected={form.fitnessLevel === value}
                onClick={() =>
                  setForm((prev) => ({ ...prev, fitnessLevel: value as FitnessLevel }))
                }
              >
                {emoji} {label}
              </ToggleButton>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Goals <span className="text-purple-600">*</span>{" "}
            <span className="font-normal text-slate-400">(select 1–3)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map(({ value, label, emoji }) => (
              <ToggleButton
                key={value}
                selected={form.goals.includes(value as Goal)}
                onClick={() => toggleGoal(value as Goal)}
              >
                {emoji} {label}
              </ToggleButton>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Available equipment <span className="text-purple-600">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map(({ value, label, emoji }) => (
              <ToggleButton
                key={value}
                selected={form.availableEquipment.includes(value as Equipment)}
                onClick={() => toggleEquipment(value as Equipment)}
              >
                {emoji} {label}
              </ToggleButton>
            ))}
          </div>
        </div>

        {/* Days per week */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Days per week{" "}
            <span className="text-xl font-extrabold tabular-nums text-purple-600">
              {form.weeklyWorkouts}
            </span>
          </p>
          <div className="flex gap-2">
            {WEEKLY_WORKOUT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, weeklyWorkouts: n }))}
                className={[
                  "h-11 w-11 rounded-xl border text-sm font-bold transition",
                  form.weeklyWorkouts === n
                    ? "border-purple-600 bg-purple-600 text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-purple-300",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred workout time */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Preferred session time <span className="text-purple-600">*</span>
          </p>
          <div className="grid grid-cols-3 gap-3 sm:max-w-sm">
            {PREFERRED_TIME_OPTIONS.map(({ value, label, timeRange, emoji }) => {
              const selected = form.preferredWorkoutTime === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      preferredWorkoutTime: value as PreferredWorkoutTime,
                    }))
                  }
                  className={[
                    "flex flex-col gap-1 rounded-2xl border p-3 text-left transition",
                    selected
                      ? "border-purple-600 bg-purple-50 ring-2 ring-purple-500/30"
                      : "border-slate-200 bg-white hover:border-purple-300",
                  ].join(" ")}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-sm font-bold text-slate-900">{label}</span>
                  <span className="text-xs text-slate-400">{timeRange}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Session duration */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">Session length</p>
          <div className="flex flex-wrap gap-2">
            {SESSION_DURATION_OPTIONS.map(({ value, label }) => (
              <ToggleButton
                key={value}
                selected={form.sessionDurationMinutes === value}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    sessionDurationMinutes: value as SessionDurationMinutes,
                  }))
                }
              >
                {label}
              </ToggleButton>
            ))}
          </div>
        </div>
      </section>

      {/* ── Health ────────────────────────────────────────────────── */}
      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>Health</h3>
        <p className="mt-1 text-sm text-slate-500">
          Optional — helps Budi choose safer exercises. Not a substitute for professional medical advice.
        </p>

        {/* Medical conditions */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">Known limitations</p>
          <div className="flex flex-wrap gap-2">
            {MEDICAL_CONDITION_OPTIONS.map(({ value, label }) => {
              const noneSelected = form.medicalConditions.includes("none");
              const isNone = value === "none";
              const disabled = !isNone && noneSelected;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleMedicalCondition(value as MedicalCondition)}
                  disabled={disabled}
                  className={[
                    "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                    form.medicalConditions.includes(value as MedicalCondition)
                      ? "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-purple-300",
                    disabled ? "cursor-not-allowed opacity-40" : "",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Medical notes */}
        <div className="mt-4">
          <label
            htmlFor="edit-medical-notes"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Additional notes{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="edit-medical-notes"
            rows={3}
            maxLength={510}
            value={form.medicalNotes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, medicalNotes: e.target.value.slice(0, 500) }))
            }
            placeholder="e.g. Right knee cleared for low-impact exercises."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {form.medicalNotes.length} / 500
          </p>
        </div>
      </section>

      {/* ── Status messages ───────────────────────────────────────── */}
      {saveError && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {saveError}
        </p>
      )}
      {success && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ Personal details updated successfully.
        </p>
      )}

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="flex gap-3 pb-4">
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSaving || success}
          className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditPersonalDetailsForm;
