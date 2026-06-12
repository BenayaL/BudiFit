import { useProgressDashboard } from "./useProgressDashboard";
import { ProgressOverview } from "./ProgressOverview";
import { ShareMenu } from "./ShareMenu";
// import { AchievementCard } from "./AchievementCard"; // You can uncomment this once your API returns achievements!

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
        <div className="mt-4">
          <ShareMenu />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Progress Dashboard</h1>
      <p className="text-slate-500 mb-8">Track your consistency and workout metrics.</p>

      <ProgressOverview summary={summary} />

      <div className="mt-8">
        <ShareMenu />
      </div>

      {/* Note: Once you add 'achievements' to your ProgressSummary model and backend, you can map over them here using AchievementCard */}
    </main>
  );
}

export default ProgressDashboardPage;
