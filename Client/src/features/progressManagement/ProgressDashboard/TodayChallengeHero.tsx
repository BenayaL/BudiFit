import { Clock, Dumbbell, Zap } from "lucide-react";
import type { DailyDashboard } from "../../workoutManagement/DailyWorkout/dailyWorkout.models";
import type { Page } from "../../../app/app.types";

interface Props {
  dashboard: DailyDashboard | null;
  isCompleting: boolean;
  onComplete: () => Promise<boolean>;
  onChangePage: (page: Page) => void;
}

function HeroCard({
  stripeColor,
  children,
}: {
  stripeColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:border-[#3B344A] dark:bg-[#211D2B]">
      <div className={`h-[5px] w-full ${stripeColor}`} />
      <div className="p-6 sm:p-7">{children}</div>
    </div>
  );
}

export function TodayChallengeHero({ dashboard, isCompleting, onComplete, onChangePage }: Props) {
  const today = dashboard?.today;
  const planDay = today?.planDay;
  const isCompleted = !!today?.completion;
  const hasActivePlan = !!dashboard?.activePlan;

  if (!hasActivePlan || !planDay) {
    return (
      <HeroCard stripeColor="bg-slate-200 dark:bg-[#3B344A]">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 dark:text-[#9E97AF]">
          Today's Challenge
        </p>
        <div className="flex items-center gap-4 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 flex-shrink-0 dark:bg-[#2A2436] dark:text-[#9E97AF]">
            <Dumbbell size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-700 leading-tight dark:text-[#F8F7FB]">
              No active plan
            </h2>
            <p className="text-sm text-slate-400 mt-1 dark:text-[#9E97AF]">
              Generate a plan to start your fitness journey.
            </p>
          </div>
        </div>
        <button
          onClick={() => onChangePage("workout")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
        >
          Go to Workout
        </button>
      </HeroCard>
    );
  }

  if (planDay.restDay) {
    return (
      <HeroCard stripeColor="bg-gradient-to-r from-blue-300 to-sky-300">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 dark:text-[#9E97AF]">
          Today's Challenge
        </p>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 flex-shrink-0 text-2xl dark:bg-blue-900/20">
            😴
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-1">
              Rest Day
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 leading-tight dark:text-[#F8F7FB]">
              Recovery Day
            </h2>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500 leading-relaxed dark:text-[#9E97AF]">
          Today is scheduled for recovery. Rest is part of training — your muscles are
          rebuilding stronger.
        </p>
      </HeroCard>
    );
  }

  const exerciseNames = planDay.exercises.slice(0, 5).map((e) => e.name);
  const extraCount = Math.max(0, planDay.exercises.length - 5);

  return (
    <HeroCard
      stripeColor={
        isCompleted
          ? "bg-gradient-to-r from-emerald-400 to-teal-400"
          : "bg-gradient-to-r from-violet-500 to-purple-500"
      }
    >
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#9E97AF]">
          Today's Challenge
        </p>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
            isCompleted
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/40"
              : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/40"
          }`}
        >
          {isCompleted ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Completed
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Ready
            </>
          )}
        </span>
      </div>

      <div className="flex items-start gap-4 mb-5">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl flex-shrink-0 ${
            isCompleted
              ? "bg-emerald-50 dark:bg-emerald-900/20"
              : "bg-violet-50 dark:bg-purple-900/20"
          }`}
        >
          {isCompleted ? "✅" : "🏋️"}
        </div>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 leading-tight dark:text-[#F8F7FB]">
            {planDay.title}
          </h2>
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#2A2436]">
                <Dumbbell size={12} className="text-slate-500 dark:text-[#9E97AF]" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-[#C9C4D6]">
                {planDay.exercises.length} exercises
              </span>
            </div>
            {planDay.durationMinutes > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#2A2436]">
                  <Clock size={12} className="text-slate-500 dark:text-[#9E97AF]" />
                </div>
                <span className="text-sm font-semibold text-slate-600 dark:text-[#C9C4D6]">
                  {planDay.durationMinutes} min
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {exerciseNames.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5 p-3 bg-slate-50 rounded-xl dark:bg-[#2A2436]">
          {exerciseNames.map((name) => (
            <span
              key={name}
              className="text-xs font-semibold text-slate-600 px-2.5 py-1 bg-white rounded-full border border-slate-200 dark:bg-[#211D2B] dark:border-[#3B344A] dark:text-[#C9C4D6]"
            >
              {name}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-xs font-semibold text-slate-400 px-2.5 py-1 dark:text-[#9E97AF]">
              +{extraCount} more
            </span>
          )}
        </div>
      )}

      <div className="border-t border-slate-100 mb-4 dark:border-[#3B344A]" />

      <div className="flex flex-wrap gap-2.5">
        {!isCompleted && (
          <button
            onClick={onComplete}
            disabled={isCompleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Zap size={14} />
            {isCompleting ? "Marking…" : "Mark as Completed"}
          </button>
        )}
        <button
          onClick={() => onChangePage("workout")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:border-[#3B344A] dark:hover:bg-[#3B344A]"
        >
          <Dumbbell size={14} className="text-slate-400 dark:text-[#9E97AF]" />
          View Workout
        </button>
      </div>
    </HeroCard>
  );
}
