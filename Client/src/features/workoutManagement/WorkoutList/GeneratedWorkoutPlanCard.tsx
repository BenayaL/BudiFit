import type {
  GeneratedWorkoutPlan,
} from "../workout.models";

interface GeneratedWorkoutPlanCardProps {
  plan: GeneratedWorkoutPlan;
  onSelect: (planId: string) => void;
}

const CATEGORY_LABELS: Record<
  GeneratedWorkoutPlan["category"],
  string
> = {
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  endurance: "Endurance",
  general_fitness: "General Fitness",
  mobility: "Mobility",
  weight_loss: "Weight Loss",
};

const CATEGORY_STYLES: Record<
  GeneratedWorkoutPlan["category"],
  string
> = {
  strength:
    "bg-purple-100 text-purple-700",
  hypertrophy:
    "bg-rose-100 text-rose-700",
  endurance:
    "bg-blue-100 text-blue-700",
  general_fitness:
    "bg-emerald-100 text-emerald-700",
  mobility:
    "bg-amber-100 text-amber-700",
  weight_loss:
    "bg-orange-100 text-orange-700",
};

// difficulty 1-2 → easy (green), 3 → medium (amber), 4-5 → hard (bordeaux)
const DIFFICULTY_ACCENT = {
  easy:   { bar: "bg-green-500", dot: "bg-green-500", button: "bg-green-600 hover:bg-green-700"  },
  medium: { bar: "bg-amber-400", dot: "bg-amber-400", button: "bg-amber-500 hover:bg-amber-600"  },
  hard:   { bar: "bg-rose-800",  dot: "bg-rose-800",  button: "bg-rose-800  hover:bg-rose-900"   },
} as const;

function getDifficultyAccent(difficulty: number) {
  if (difficulty <= 2) return DIFFICULTY_ACCENT.easy;
  if (difficulty === 3) return DIFFICULTY_ACCENT.medium;
  return DIFFICULTY_ACCENT.hard;
}

export function GeneratedWorkoutPlanCard({
  plan,
  onSelect,
}: GeneratedWorkoutPlanCardProps) {
  const accent = getDifficultyAccent(plan.difficulty);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className={`h-2 ${accent.bar}`} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              CATEGORY_STYLES[plan.category]
            }`}
          >
            {CATEGORY_LABELS[plan.category]}
          </span>

          <div
            className="flex gap-1"
            aria-label={`Difficulty ${plan.difficulty} out of 5`}
          >
            {Array.from({ length: 5 }).map(
              (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-5 rounded-full ${
                    index < plan.difficulty
                      ? accent.dot
                      : "bg-slate-200"
                  }`}
                />
              )
            )}
          </div>
        </div>

        <h2 className="mt-5 text-xl font-extrabold text-slate-900">
          {plan.title}
        </h2>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
          {plan.description}
        </p>

        {plan.requiresProfessionalReview && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
            This plan requires professional review.
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {plan.durationWeeks} weeks
          </span>

          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {plan.workoutDaysPerWeek} days/week
          </span>

          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            {plan.days.length} schedule days
          </span>
        </div>

        {plan.equipment.length > 0 && (
          <p className="mt-4 text-xs font-medium text-slate-500">
            Equipment:{" "}
            {plan.equipment.join(", ")}
          </p>
        )}

        <button
          type="button"
          onClick={() => onSelect(plan.id)}
          className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition ${accent.button}`}
        >
          View workout plan
        </button>
      </div>
    </article>
  );
}

export default GeneratedWorkoutPlanCard;