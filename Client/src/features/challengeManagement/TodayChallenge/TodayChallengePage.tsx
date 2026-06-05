import { useTodayChallenge } from "./useTodayChallenge";

function TodayChallengePage() {
  const { challenge, isLoading, error } = useTodayChallenge();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading today's challenge…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (!challenge) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Today's Challenge</h1>
        <p className="mt-2 text-slate-500">
          No challenge available yet. Connect the backend to get your daily challenge.
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">{challenge.title}</h1>
      <p className="mt-2 text-slate-500">{challenge.description}</p>
    </main>
  );
}

export default TodayChallengePage;
