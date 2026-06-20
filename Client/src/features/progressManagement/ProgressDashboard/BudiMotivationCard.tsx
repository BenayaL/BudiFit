import { Sparkles } from "lucide-react";

interface Props {
  streak: number;
  isCompleted: boolean;
  hasActivePlan: boolean;
}

function getMotivationText(streak: number, isCompleted: boolean, hasActivePlan: boolean): string {
  if (!hasActivePlan) return "Generate a plan and Budi will help you stay consistent.";
  if (isCompleted) return "Great job completing today's challenge 💪";
  if (streak >= 3) return "You're building real consistency 🔥";
  return "One workout today can keep your momentum alive.";
}

export function BudiMotivationCard({ streak, isCompleted, hasActivePlan }: Props) {
  const text = getMotivationText(streak, isCompleted, hasActivePlan);

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:border-[#3B344A] dark:bg-[#211D2B]">
      <div className="h-[5px] w-full bg-gradient-to-r from-violet-400 to-purple-500" />
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-lg flex-shrink-0 dark:bg-purple-900/20">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-500 leading-none">
              Budi says
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 flex-shrink-0 dark:bg-amber-900/20">
            <Sparkles size={14} className="text-amber-500" />
          </div>
        </div>

        <p className="border-l-[3px] border-violet-200 pl-3 text-sm font-medium text-slate-700 leading-relaxed dark:border-violet-700 dark:text-[#C9C4D6]">
          {text}
        </p>
      </div>
    </div>
  );
}
