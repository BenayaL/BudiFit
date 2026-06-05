interface TraineeGoalsProps {
  goals: string[];
}

export function TraineeGoals({ goals }: TraineeGoalsProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-extrabold text-slate-900">Goals</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {goals.map((goal) => (
          <span key={goal} className="rounded-full bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700">
            {goal}
          </span>
        ))}
      </div>
    </article>
  );
}

export default TraineeGoals;
