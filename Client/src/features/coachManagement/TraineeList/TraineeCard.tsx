import type { Trainee } from "../coach.models";

interface TraineeCardProps {
  trainee: Trainee;
  onViewProfile?: (traineeId: string) => void;
}

function getStatusLabel(status: Trainee["status"]) {
  if (status === "active") return "Active";
  if (status === "needs_attention") return "Needs attention";
  return "Inactive";
}

function getStatusClasses(status: Trainee["status"]) {
  if (status === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50";
  if (status === "needs_attention") return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50";
  return "bg-slate-50 text-slate-500 border-slate-200 dark:bg-[#2A2436]/50 dark:text-[#9E97AF] dark:border-[#3B344A]";
}

export function TraineeCard({ trainee, onViewProfile }: TraineeCardProps) {
  const goals = Array.isArray(trainee.goals) ? trainee.goals : [];
  const weeklyActivity =
    Array.isArray(trainee.weeklyActivity) && trainee.weeklyActivity.length === 7
      ? trainee.weeklyActivity
      : [0, 0, 0, 0, 0, 0, 0];
  const firstInitial = trainee.firstName?.charAt(0) || "?";
  const lastInitial = trainee.lastName?.charAt(0) || "";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-extrabold text-white"
            style={{ backgroundColor: trainee.color }}
          >
            {firstInitial}{lastInitial}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-[#F8F7FB]">
              {trainee.firstName} {trainee.lastName}
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#9E97AF]">
              {trainee.level} · {trainee.streakDays} day streak
            </p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(trainee.status)}`}>
          {getStatusLabel(trainee.status)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-[#2A2436]/50">
          <p className="text-xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">{trainee.completedChallenges}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-[#9E97AF]">Completed</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-[#2A2436]/50">
          <p className="text-xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">{trainee.missedWorkouts}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-[#9E97AF]">Missed</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-[#2A2436]/50">
          <p className="text-xl font-extrabold text-slate-900 dark:text-[#F8F7FB]">{goals.length}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-[#9E97AF]">Goals</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-[#9E97AF]">Weekly activity</p>
        <div className="flex gap-1.5">
          {weeklyActivity.map((value, index) => (
            <div
              key={index}
              className={`h-8 flex-1 rounded-lg ${value > 0 ? "bg-purple-500" : "bg-slate-100 dark:bg-[#2A2436]"}`}
              title={`${value} activities`}
            />
          ))}
        </div>
      </div>

      {onViewProfile && (
        <button
          type="button"
          onClick={() => onViewProfile(trainee.userId)}
          className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
        >
          View profile
        </button>
      )}
    </article>
  );
}

export default TraineeCard;
