import type { FitnessLevel } from "../../user.models";
import { FITNESS_LEVEL_OPTIONS } from "../onboarding.constants";

interface FitnessLevelStepProps {
  fitnessLevel: FitnessLevel | "";
  onSelect: (level: FitnessLevel) => void;
  validationError: string | null;
}

export function FitnessLevelStep({ fitnessLevel, onSelect, validationError }: FitnessLevelStepProps) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Step 4 · Fitness level
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
        Where are you today?
      </h2>
      <p className="mt-2 mb-8 text-slate-500">
        Budi adapts every workout to your current level.
      </p>

      <fieldset>
        <legend className="sr-only">Select your fitness level</legend>
        <div className="flex flex-col gap-3">
          {FITNESS_LEVEL_OPTIONS.map(({ value, label, description, emoji }) => {
            const selected = fitnessLevel === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onSelect(value)}
                aria-pressed={selected}
                className={[
                  "flex items-center gap-4 rounded-2xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40",
                  selected
                    ? "border-purple-600 bg-purple-50 ring-2 ring-purple-500/30"
                    : "border-slate-200 bg-white hover:border-purple-300",
                ].join(" ")}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                  {emoji}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-950">{label}</div>
                  <div className="mt-0.5 text-sm text-slate-500">{description}</div>
                </div>
                <div
                  className={[
                    "h-5 w-5 shrink-0 rounded-full border-2 transition",
                    selected
                      ? "border-purple-600 bg-purple-600"
                      : "border-slate-300 bg-white",
                  ].join(" ")}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </fieldset>

      {validationError && (
        <p className="mt-3 text-xs font-medium text-red-500" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}
