import type { EditablePlan, PlanEditorValidationErrors } from "./planEditor.types";

const CATEGORIES = [
  { value: "strength", label: "Strength" },
  { value: "hypertrophy", label: "Hypertrophy" },
  { value: "endurance", label: "Endurance" },
  { value: "general_fitness", label: "General Fitness" },
  { value: "mobility", label: "Mobility" },
  { value: "weight_loss", label: "Weight Loss" },
] as const;

interface PlanDetailsEditorProps {
  plan: EditablePlan;
  errors: PlanEditorValidationErrors;
  onChange: (updates: Partial<EditablePlan>) => void;
}

const inp =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-200 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:placeholder:text-[#9E97AF] dark:focus:border-purple-600 dark:focus:ring-purple-900/30";
const inpErr = "border-red-300 focus:border-red-400 focus:ring-red-100";
const lbl = "mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#9E97AF]";
const errTxt = "mt-1 text-xs text-red-600";

export function PlanDetailsEditor({
  plan,
  errors,
  onChange,
}: PlanDetailsEditorProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
      <h2 className="mb-5 text-lg font-extrabold text-slate-900 dark:text-[#F8F7FB]">
        Plan details
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={lbl}>Title</label>
          <input
            type="text"
            value={plan.title}
            onChange={(e) => onChange({ title: e.target.value })}
            maxLength={200}
            placeholder="e.g. 4-Week Full Body Strength Program"
            className={`${inp} ${errors.title ? inpErr : ""}`}
          />
          {errors.title && <p className={errTxt}>{errors.title}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={lbl}>Description</label>
          <textarea
            rows={3}
            value={plan.description}
            onChange={(e) => onChange({ description: e.target.value })}
            maxLength={5000}
            placeholder="Overview of what this plan targets and how it works…"
            className={`${inp} resize-none ${errors.description ? inpErr : ""}`}
          />
          {errors.description && <p className={errTxt}>{errors.description}</p>}
        </div>

        <div>
          <label className={lbl}>Category</label>
          <select
            value={plan.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className={`${inp} ${errors.category ? inpErr : ""}`}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.category && <p className={errTxt}>{errors.category}</p>}
        </div>

        <div>
          <label className={lbl}>Difficulty (1 – 5)</label>
          <input
            type="number"
            min={1}
            max={5}
            step={1}
            value={plan.difficulty}
            onChange={(e) => onChange({ difficulty: Math.round(Number(e.target.value)) })}
            className={`${inp} ${errors.difficulty ? inpErr : ""}`}
          />
          {errors.difficulty && <p className={errTxt}>{errors.difficulty}</p>}
        </div>

        <div>
          <label className={lbl}>Duration (weeks)</label>
          <input
            type="number"
            min={1}
            max={12}
            step={1}
            value={plan.durationWeeks}
            onChange={(e) => onChange({ durationWeeks: Math.round(Number(e.target.value)) })}
            className={`${inp} ${errors.durationWeeks ? inpErr : ""}`}
          />
          {errors.durationWeeks && <p className={errTxt}>{errors.durationWeeks}</p>}
        </div>

        <div>
          <label className={lbl}>Workout days / week</label>
          <input
            type="number"
            min={1}
            max={7}
            step={1}
            value={plan.workoutDaysPerWeek}
            onChange={(e) => onChange({ workoutDaysPerWeek: Math.round(Number(e.target.value)) })}
            className={`${inp} ${errors.workoutDaysPerWeek ? inpErr : ""}`}
          />
          {errors.workoutDaysPerWeek && <p className={errTxt}>{errors.workoutDaysPerWeek}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={lbl}>
            Equipment{" "}
            <span className="font-normal text-slate-400 dark:text-[#9E97AF]">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={plan.equipmentStr}
            onChange={(e) => onChange({ equipmentStr: e.target.value })}
            placeholder="e.g. dumbbells, resistance bands, pull-up bar"
            className={`${inp} ${errors.equipment ? inpErr : ""}`}
          />
          {errors.equipment && <p className={errTxt}>{errors.equipment}</p>}
        </div>
      </div>
    </section>
  );
}
