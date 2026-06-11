interface BodyStatsStepProps {
  height: string;
  weight: string;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  validationError: string | null;
}

function computeBmi(height: string, weight: string): number | null {
  const h = Number(height);
  const w = Number(weight);
  if (!h || !w || h < 100 || h > 250 || w < 30 || w > 300) return null;
  return w / ((h / 100) ** 2);
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600" };
  if (bmi < 25) return { label: "Normal weight", color: "text-green-600" };
  if (bmi < 30) return { label: "Overweight", color: "text-amber-600" };
  return { label: "Obese", color: "text-red-600" };
}

export function BodyStatsStep({
  height,
  weight,
  onHeightChange,
  onWeightChange,
  validationError,
}: BodyStatsStepProps) {
  const bmi = computeBmi(height, weight);
  const category = bmi !== null ? bmiCategory(bmi) : null;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Step 3 · Body stats
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
        Height & weight
      </h2>
      <p className="mt-2 text-slate-500">
        Budi uses these to track your body progress over time.
      </p>
      <div className="mt-1 mb-8 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
        Both fields are optional — you can skip this step.
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="onboarding-height"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Height
          </label>
          <div className="relative">
            <input
              id="onboarding-height"
              type="number"
              inputMode="decimal"
              min={100}
              max={250}
              value={height}
              onChange={(e) => onHeightChange(e.target.value)}
              placeholder="175"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-xl font-bold text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              cm
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="onboarding-weight"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Weight
          </label>
          <div className="relative">
            <input
              id="onboarding-weight"
              type="number"
              inputMode="decimal"
              min={30}
              max={300}
              value={weight}
              onChange={(e) => onWeightChange(e.target.value)}
              placeholder="70"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-xl font-bold text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              kg
            </span>
          </div>
        </div>
      </div>

      {validationError && (
        <p className="mt-3 text-xs font-medium text-red-500" role="alert">
          {validationError}
        </p>
      )}

      {bmi !== null && category !== null && (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <div className="text-3xl">📊</div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              BMI estimate
            </div>
            <div className={`text-2xl font-extrabold tabular-nums ${category.color}`}>
              {bmi.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Category
            </div>
            <div className={`text-sm font-bold ${category.color}`}>{category.label}</div>
          </div>
          <p className="ml-auto max-w-[160px] text-xs text-slate-400">
            BMI is a general estimate only and is not stored.
          </p>
        </div>
      )}
    </div>
  );
}
