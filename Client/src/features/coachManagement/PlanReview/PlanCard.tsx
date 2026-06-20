import type { CoachPlan } from "../coach.models";
import { PlanStatusBadge } from "./PlanStatusBadge";

interface PlanCardProps {
  plan: CoachPlan;
  onReviewPlan: (planId: string) => void;
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Beginner", 2: "Easy", 3: "Intermediate", 4: "Hard", 5: "Epic",
};

export function PlanCard({ plan, onReviewPlan }: PlanCardProps) {
  const totalExercises = plan.days.reduce(
    (sum, day) => sum + (day.restDay ? 0 : day.exercises.length),
    0
  );
  const workoutDays = plan.days.filter((d) => !d.restDay).length;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-[#F8F7FB]">{plan.title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#9E97AF]">Trainee: {plan.traineeName}</p>
        </div>
        <PlanStatusBadge approvalStatus={plan.approvalStatus} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-[#3B344A] dark:text-[#C9C4D6]">
          {plan.durationWeeks} weeks
        </span>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-[#3B344A] dark:text-[#C9C4D6]">
          {workoutDays} workout days
        </span>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-[#3B344A] dark:text-[#C9C4D6]">
          {totalExercises} exercises
        </span>
        {plan.difficulty ? (
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-[#3B344A] dark:text-[#C9C4D6]">
            {DIFFICULTY_LABELS[plan.difficulty] ?? `Level ${plan.difficulty}`}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onReviewPlan(plan.id)}
        className="mt-5 w-full rounded-2xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
      >
        {plan.approvalStatus === "pending_review" ? "Review plan" : "Edit plan"}
      </button>
    </article>
  );
}

export default PlanCard;
