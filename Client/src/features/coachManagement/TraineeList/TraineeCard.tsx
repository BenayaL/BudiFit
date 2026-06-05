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
  if (status === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "needs_attention") return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-slate-50 text-slate-500 border-slate-200";
}

export function TraineeCard({ trainee, onViewProfile }: TraineeCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-extrabold text-white"
            style={{ backgroundColor: trainee.color }}
          >
            {trainee.firstName.charAt(0)}{trainee.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">
              {trainee.firstName} {trainee.lastName}
            </h3>
            <p className="text-sm text-slate-500">
              {trainee.level} · {trainee.streakDays} day streak
            </p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(trainee.status)}`}>
          {getStatusLabel(trainee.status)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xl font-extrabold text-slate-900">{trainee.completedChallenges}</p>
          <p className="text-xs font-medium text-slate-500">Challenges</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xl font-extrabold text-slate-900">{trainee.missedWorkouts}</p>
          <p className="text-xs font-medium text-slate-500">Missed</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xl font-extrabold text-slate-900">{trainee.goals.length}</p>
          <p className="text-xs font-medium text-slate-500">Goals</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Weekly activity</p>
        <div className="flex gap-1.5">
          {trainee.weeklyActivity.map((value, index) => (
            <div
              key={index}
              className={`h-8 flex-1 rounded-lg ${value > 0 ? "bg-purple-500" : "bg-slate-100"}`}
              title={`${value} activities`}
            />
          ))}
        </div>
      </div>

      {onViewProfile && (
        <button
          type="button"
          onClick={() => onViewProfile(trainee.userId)}
          className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          View profile
        </button>
      )}
    </article>
  );
}

export default TraineeCard;
