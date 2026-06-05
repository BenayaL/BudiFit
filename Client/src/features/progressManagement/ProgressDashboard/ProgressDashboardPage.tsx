import { useProgressDashboard } from "./useProgressDashboard";
import { ProgressOverview } from "./ProgressOverview";
// import { AchievementCard } from "./AchievementCard"; // You can uncomment this once your API returns achievements!

function ProgressDashboardPage() {
  const { summary, isLoading, error } = useProgressDashboard();

  // --- Native Web Share API Implementation (MongoDB Ready) ---
  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Safe Type Assertion using 'as any' to bypass the missing field check 
        // until MongoDB is fully integrated into the ProgressSummary model.
        const progressId = (summary as any)?._id || "guest_user"; 
        
        await navigator.share({
          title: 'My BudiFit Progress!',
          text: `I am training with BudiFit! My current streak is: ${summary?.currentStreak || 0} days! 💪`,
          url: `${window.location.origin}/progress/${progressId}`,
        });
      } catch (err) {
        console.log('Sharing was cancelled or failed:', err);
      }
    } else {
      alert('Native sharing is not supported on this browser. Link: ' + window.location.origin);
    }
  };
  // ------------------------------------------------------------

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading progress…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (!summary) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        <p className="mt-2 text-slate-500">
          No progress data yet. Connect the backend to see your stats.
        </p>
        <button 
          onClick={handleShare} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded font-medium shadow-md hover:bg-blue-600 transition-colors"
        >
          Share Progress  📢
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">Progress Dashboard</h1>
      <p className="text-slate-500 mb-8">Track your consistency and workout metrics.</p>
      
      {/* This replaces your old paragraph tag and renders the nice grid! */}
      <ProgressOverview summary={summary} />

      <div className="mt-8">
        <button 
          onClick={handleShare} 
          className="px-4 py-2 bg-blue-500 text-white rounded font-medium shadow-md hover:bg-blue-600 transition-colors"
        >
          Share Progress 📢
        </button>
      </div>

      {/* Note: Once you add 'achievements' to your ProgressSummary model and backend, you can map over them here using AchievementCard */}
    </main>
  );
}

export default ProgressDashboardPage;