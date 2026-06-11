import type { MedicalCondition } from "../../user.models";
import { MEDICAL_CONDITION_OPTIONS } from "../onboarding.constants";
import { SelectableTile } from "../components/SelectableTile";

const MAX_NOTES = 500;

interface HealthStepProps {
  medicalConditions: MedicalCondition[];
  medicalNotes: string;
  onToggleCondition: (condition: MedicalCondition) => void;
  onNotesChange: (value: string) => void;
  validationError: string | null;
}

export function HealthStep({
  medicalConditions,
  medicalNotes,
  onToggleCondition,
  onNotesChange,
  validationError,
}: HealthStepProps) {
  const remaining = MAX_NOTES - medicalNotes.length;
  const notesOverLimit = medicalNotes.length > MAX_NOTES;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Step 7 · Health & limitations
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
        Any physical limitations?
      </h2>
      <p className="mt-2 mb-2 text-slate-500">
        This step is optional. Budi uses this information to choose safer exercises for you.
      </p>
      <p className="mb-8 text-xs text-slate-400">
        Share only information relevant to exercising safely. This does not replace professional medical advice.
      </p>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-700">
          Known limitations
          <span className="ml-2 font-normal text-slate-400">(optional — select all that apply)</span>
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MEDICAL_CONDITION_OPTIONS.map(({ value, label }) => {
            const selected = medicalConditions.includes(value);
            const isNoneOption = value === "none";
            const noneSelected = medicalConditions.includes("none");
            const disabledByNone = !isNoneOption && noneSelected;
            return (
              <SelectableTile
                key={value}
                selected={selected}
                onClick={() => onToggleCondition(value)}
                label={label}
                className={[
                  "flex items-center gap-3",
                  disabledByNone ? "cursor-not-allowed opacity-40" : "",
                ].join(" ")}
              >
                <span className="text-sm font-medium text-slate-800">{label}</span>
              </SelectableTile>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <label
          htmlFor="onboarding-medical-notes"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Additional notes
          <span className="ml-1 font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="onboarding-medical-notes"
          value={medicalNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          maxLength={MAX_NOTES + 10}
          placeholder="e.g. Right knee meniscus surgery 6 months ago, cleared for low-impact exercises."
          className={[
            "w-full resize-none rounded-2xl border bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-300 focus:ring-4 focus:ring-purple-500/15",
            notesOverLimit
              ? "border-red-400 focus:border-red-500"
              : "border-slate-200 focus:border-purple-500",
          ].join(" ")}
          aria-describedby="notes-char-count"
        />
        <p
          id="notes-char-count"
          className={[
            "mt-1 text-right text-xs",
            notesOverLimit ? "font-semibold text-red-500" : "text-slate-400",
          ].join(" ")}
        >
          {medicalNotes.length} / {MAX_NOTES}
          {notesOverLimit && ` — ${-remaining} characters over the limit`}
        </p>
      </div>

      {validationError && (
        <p className="mt-2 text-xs font-medium text-red-500" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}
