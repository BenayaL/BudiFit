import { useState } from "react";
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

// 1-2 → easy (green), 3 → medium (amber), 4 → hard (red), 5 → epic (blue)
const DIFFICULTY_ACCENT = {
  easy:   { color: "#10B981", hover: "#059669" },
  medium: { color: "#F59E0B", hover: "#D97706" },
  hard:   { color: "#E11D48", hover: "#BE123C" },
  epic:   { color: "#1D4ED8", hover: "#1E40AF" },
} as const;

function getDifficultyAccent(difficulty: number) {
  if (difficulty <= 2) return DIFFICULTY_ACCENT.easy;
  if (difficulty === 3) return DIFFICULTY_ACCENT.medium;
  if (difficulty === 4) return DIFFICULTY_ACCENT.hard;
  return DIFFICULTY_ACCENT.epic;
}

export function GeneratedWorkoutPlanCard({
  plan,
  onSelect,
}: GeneratedWorkoutPlanCardProps) {
  const accent = getDifficultyAccent(plan.difficulty);
  const [btnHover, setBtnHover] = useState(false);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div
        className="h-2"
        style={{ backgroundColor: accent.color }}
      />

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
                  className="h-1.5 w-5 rounded-full"
                  style={{
                    backgroundColor:
                      index < plan.difficulty
                        ? accent.color
                        : "#E2E8F0",
                  }}
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
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          className="mt-6 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition"
          style={{
            backgroundColor: btnHover
              ? accent.hover
              : accent.color,
          }}
        >
          View workout plan
        </button>
      </div>
    </article>
  );
}

export default GeneratedWorkoutPlanCard;