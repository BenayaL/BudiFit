import type { Trainee } from "../coach.models";

interface TraineeSummaryProps {
  trainee: Trainee;
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}

export function TraineeSummary({ trainee }: TraineeSummaryProps) {
  return (
    <section className="mb-8 grid gap-4 md:grid-cols-4">
      <ProfileStat label="Level" value={trainee.level} />
      <ProfileStat label="Streak" value={`${trainee.streakDays} days`} />
      <ProfileStat label="Completed" value={trainee.completedChallenges.toString()} />
      <ProfileStat label="Missed" value={trainee.missedWorkouts.toString()} />
    </section>
  );
}

export default TraineeSummary;
