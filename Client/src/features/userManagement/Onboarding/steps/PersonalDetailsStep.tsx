import type { Gender } from "../../user.models";
import { GENDER_OPTIONS } from "../onboarding.constants";

interface PersonalDetailsStepProps {
  age: string;
  gender: Gender | "";
  onAgeChange: (value: string) => void;
  onGenderChange: (value: Gender | "") => void;
  validationError: string | null;
}

export function PersonalDetailsStep({
  age,
  gender,
  onAgeChange,
  onGenderChange,
  validationError,
}: PersonalDetailsStepProps) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Step 2 · Personal details
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
        A little about you
      </h2>
      <p className="mt-2 mb-8 text-slate-500">
        Budi uses your age to set appropriate challenge intensity.
      </p>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="onboarding-age"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Age <span className="text-purple-600">*</span>
          </label>
          <div className="relative w-40">
            <input
              id="onboarding-age"
              type="number"
              inputMode="numeric"
              min={10}
              max={99}
              value={age}
              onChange={(e) => onAgeChange(e.target.value)}
              placeholder="e.g. 25"
              autoFocus
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-14 text-2xl font-bold text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
              aria-describedby={validationError ? "age-error" : undefined}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              yrs
            </span>
          </div>
          {validationError && (
            <p id="age-error" className="mt-1.5 text-xs font-medium text-red-500" role="alert">
              {validationError}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-700">
            Gender{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map(({ value, label }) => {
              const selected = gender === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onGenderChange(selected ? "" : value)}
                  aria-pressed={selected}
                  className={[
                    "rounded-2xl border px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40",
                    selected
                      ? "border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-500/30"
                      : "border-slate-200 bg-white text-slate-700 hover:border-purple-300",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
