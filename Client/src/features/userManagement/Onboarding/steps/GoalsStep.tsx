import type { Goal } from "../../user.models";
import { GOAL_OPTIONS } from "../onboarding.constants";
import { SelectableTile } from "../components/SelectableTile";

interface GoalsStepProps {
  goals: Goal[];
  onToggle: (goal: Goal) => void;
  validationError: string | null;
}

export function GoalsStep({ goals, onToggle, validationError }: GoalsStepProps) {
  const atMax = goals.length >= 3;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Step 5 · Your goals
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
        What are you training for?
      </h2>
      <p className="mt-2 mb-8 text-slate-500">
        Pick up to 3 goals.{" "}
        <span className="font-semibold text-purple-600">{goals.length} / 3 selected</span>
      </p>

      <fieldset>
        <legend className="sr-only">Select up to 3 goals</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GOAL_OPTIONS.map(({ value, label, emoji }) => {
            const selected = goals.includes(value);
            const disabled = !selected && atMax;
            return (
              <SelectableTile
                key={value}
                selected={selected}
                onClick={() => { if (!disabled) onToggle(value); }}
                label={label}
                className={[
                  "flex flex-col gap-2",
                  disabled ? "cursor-not-allowed opacity-40" : "",
                ].join(" ")}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-sm font-semibold text-slate-800">{label}</span>
              </SelectableTile>
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
