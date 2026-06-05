import { useProgressDashboard } from "./useProgressDashboard";

function ProgressDashboardPage() {
  const { summary, isLoading, error } = useProgressDashboard();

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading progress…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (!summary) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        <p className="mt-2 text-slate-500">
          No progress data yet. Connect the backend to see your stats.
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Progress Dashboard</h1>
      <p className="mt-2 text-slate-500">Current streak: {summary.currentStreak} days</p>
    </main>
  );
}

export default ProgressDashboardPage;
