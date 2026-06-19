import type { Trainee } from "../coach.models";

interface TraineePersonalDetailsProps {
  trainee: Trainee;
}

function fmt(val: string | undefined): string {
  if (!val) return "—";
  return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-50 py-2 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function ChipRow({
  label,
  items,
  chipClass,
}: {
  label: string;
  items: string[];
  chipClass: string;
}) {
  return (
    <div className="mt-5">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className={`rounded-full px-3 py-1 text-xs font-bold ${chipClass}`}>
              {fmt(item)}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-400">Not specified</p>
      )}
    </div>
  );
}

export function TraineePersonalDetails({ trainee }: TraineePersonalDetailsProps) {
  const meaningfulConditions = (trainee.medicalConditions ?? []).filter((c) => c !== "none");
  const equipment = trainee.availableEquipment ?? [];

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-extrabold text-slate-900">Personal details</h2>

      <div className="mt-5">
        <DetailRow label="Fitness level" value={fmt(trainee.level)} />
        {trainee.age !== undefined && (
          <DetailRow label="Age" value={`${trainee.age} years`} />
        )}
        {trainee.gender && (
          <DetailRow label="Gender" value={fmt(trainee.gender)} />
        )}
        {trainee.height !== undefined && (
          <DetailRow label="Height" value={`${trainee.height} cm`} />
        )}
        {trainee.weight !== undefined && (
          <DetailRow label="Weight" value={`${trainee.weight} kg`} />
        )}
        {trainee.weeklyWorkouts !== undefined && (
          <DetailRow label="Weekly workouts" value={`${trainee.weeklyWorkouts} days / week`} />
        )}
        {trainee.sessionDurationMinutes !== undefined && (
          <DetailRow label="Session duration" value={`${trainee.sessionDurationMinutes} min`} />
        )}
        {trainee.preferredWorkoutTime && (
          <DetailRow label="Preferred time" value={fmt(trainee.preferredWorkoutTime)} />
        )}
      </div>

      <ChipRow
        label="Goals"
        items={trainee.goals}
        chipClass="bg-purple-50 text-purple-700"
      />

      <ChipRow
        label="Equipment"
        items={equipment}
        chipClass="bg-slate-100 text-slate-700"
      />

      {(meaningfulConditions.length > 0 || trainee.medicalNotes) && (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Limitations
          </p>
          {meaningfulConditions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {meaningfulConditions.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"
                >
                  {fmt(c)}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">None reported</p>
          )}
          {trainee.medicalNotes && (
            <blockquote className="mt-3 rounded-xl border-l-4 border-amber-300 bg-amber-50 py-2 pl-3 pr-2 text-sm italic text-slate-700">
              {trainee.medicalNotes}
            </blockquote>
          )}
        </div>
      )}
    </article>
  );
}

export default TraineePersonalDetails;
