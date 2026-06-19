interface CoachStatsCardProps {
  totalTrainees: number;
  activeTrainees: number;
  traineesNeedingAttention: number;
  pendingPlansCount: number;
  pendingRequestsCount: number;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export function CoachStatsCard({
  totalTrainees,
  activeTrainees,
  traineesNeedingAttention,
  pendingPlansCount,
  pendingRequestsCount,
}: CoachStatsCardProps) {
  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Trainees" value={totalTrainees.toString()} />
      <StatCard label="Active trainees" value={activeTrainees.toString()} />
      <StatCard label="Need attention" value={traineesNeedingAttention.toString()} />
      <StatCard label="Pending plans" value={pendingPlansCount.toString()} />
      <StatCard label="Pending requests" value={pendingRequestsCount.toString()} />
    </section>
  );
}

export default CoachStatsCard;
