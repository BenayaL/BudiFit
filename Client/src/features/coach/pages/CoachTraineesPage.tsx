import { fakeTrainees } from "../../../Data/fakeData";
import TraineeCard from "../components/TraineeCard";

interface CoachTraineesPageProps {
  onViewTraineeProfile: (traineeId: string) => void;
}

export default function CoachTraineesPage({
  onViewTraineeProfile,
}: CoachTraineesPageProps) {
  const activeTrainees = fakeTrainees.filter(
    (trainee) => trainee.status === "active"
  );

  const attentionTrainees = fakeTrainees.filter(
    (trainee) => trainee.status === "needs_attention"
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">
          Coach trainees
        </p>

        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
          My trainees
        </h1>

        <p className="mt-3 max-w-2xl text-slate-500">
          Here the coach can monitor each trainee, identify who needs attention,
          and open a full trainee profile.
        </p>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total trainees" value={fakeTrainees.length} />
        <SummaryCard label="Active" value={activeTrainees.length} />
        <SummaryCard label="Need attention" value={attentionTrainees.length} />
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
          Trainee list
        </h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fakeTrainees.map((trainee) => (
            <TraineeCard
              key={trainee.userId}
              trainee={trainee}
              onViewProfile={onViewTraineeProfile}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}