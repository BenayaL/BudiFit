import { useWorkoutList } from "./useWorkoutList";
import { WorkoutCard } from "./WorkoutCard";

function WorkoutListPage() {
  const { workouts, isLoading, error } = useWorkoutList();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading workouts…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <section className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Workouts</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Your workouts</h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          Select a workout to start your session. New plans are generated daily by Budi.
        </p>
      </section>

      {workouts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-2xl font-extrabold text-slate-900">No workouts yet</p>
          <p className="mt-3 text-slate-500">
            Workouts will appear here once the backend is connected and Budi generates your plan.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onSelect={(id) => alert(`Starting workout ${id} — detail view coming soon.`)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default WorkoutListPage;
