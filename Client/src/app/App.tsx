import { useState, useEffect } from "react";

// features — domain pages
import WelcomePage from "../features/welcome/WelcomePage";
import LoginPage from "../features/userManagement/Login/LoginPage";
import RegisterPage from "../features/userManagement/Register/RegisterPage";
import UserProfilePage from "../features/userManagement/UserProfile/UserProfilePage";
import CoachDashboardPage from "../features/coachManagement/CoachDashboard/CoachDashboardPage";
import TraineeListPage from "../features/coachManagement/TraineeList/TraineeListPage";
import TraineeDetailsPage from "../features/coachManagement/TraineeDetails/TraineeDetailsPage";
import PlanListPage from "../features/coachManagement/PlanReview/PlanListPage";
import PlanReviewPage from "../features/coachManagement/PlanReview/PlanReviewPage";
import BotChatPage from "../features/botManagement/BotChat/BotChatPage";
import ProgressDashboardPage from "../features/progressManagement/ProgressDashboard/ProgressDashboardPage";
import WorkoutPage from "../features/workoutManagement/WorkoutPage";
import GeneratedWorkoutPlanDetailsPage from "../features/workoutManagement/WorkoutList/GeneratedWorkoutPlanDetails/GeneratedWorkoutPlanDetailsPage";
import TraineeOnboardingPage from "../features/userManagement/Onboarding/TraineeOnboardingPage";
import WorkoutHistoryPage from "../features/workoutManagement/WorkoutHistory/WorkoutHistoryPage";
import SettingsPage from "../features/settingsManagement/Settings/SettingsPage";
import NotificationPage from "../features/notificationManagement/NotificationPage";
import { NotificationToastContainer } from "../features/notificationManagement/NotificationToastContainer";

// common
import TopNav from "../common/TopNav/TopNav";

// app
import type { Page } from "./app.types";
import { coachPages, traineePages } from "./routes";
import { coachNavItems, traineeNavItems } from "./navigation";
import { useAuth } from "./AuthContext";

// ─── Loading screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfaf7] dark:bg-[#141218]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
        <p className="text-sm font-medium text-slate-500">Loading…</p>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const { user, isInitializing, logout, setOnboardingComplete } = useAuth();

  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string | null>(null);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [selectedWorkoutPlanId, setSelectedWorkoutPlanId,] = useState<string | null>(null);

  // After initialization, determine the correct starting page
  useEffect(() => {
    if (isInitializing) return;

    if (!user) {
      setCurrentPage("welcome");
      return;
    }

    // Only auto-navigate if we haven't already set a page
    setCurrentPage((prev) => {
      if (prev !== null) return prev; // keep the existing page if already navigated

      if (user.role === "coach") return "coach-dashboard";
      if (!user.hasCompletedOnboarding) return "trainee-onboarding";
      return "dashboard";
    });
  }, [isInitializing, user]);

  // Show loading while auth is being restored or page hasn't been determined yet
  if (isInitializing || currentPage === null) {
    return <LoadingScreen />;
  }

  const currentRole = user?.role ?? "trainee";
  const activeNavItems = currentRole === "coach" ? coachNavItems : traineeNavItems;
  const visiblePages = currentRole === "coach" ? coachPages : traineePages;
  const isMainAppPage = visiblePages.includes(currentPage) || currentPage === "settings";

  const navUser = {
    name: user ? `${user.firstName} ${user.lastName}` : "",
    avatarLetter: user ? user.firstName.charAt(0).toUpperCase() : "?",
    avatarIcon: user?.avatarIcon,
  };

  async function handleLogout() {
    await logout();
    setCurrentPage("welcome");
  }

  function handleLoginSuccess(loginRole: "trainee" | "coach", hasCompletedOnboarding: boolean) {
    if (loginRole === "coach") {
      setCurrentPage("coach-dashboard");
    } else if (!hasCompletedOnboarding) {
      setCurrentPage("trainee-onboarding");
    } else {
      setCurrentPage("dashboard");
    }
  }

  function withNav(content: React.ReactNode, activePage: Page = currentPage!) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] dark:bg-[#141218]">
        <TopNav
          items={activeNavItems}
          activePage={activePage}
          onChangePage={(page) => setCurrentPage(page)}
          user={navUser}
          onStartWorkout={() => setCurrentPage("workout")}
          onGoToProfile={() => setCurrentPage("profile")}
        />
        <NotificationToastContainer
          onChangePage={(page) => setCurrentPage(page)}
          onReviewPlan={(planId) => {
            setSelectedPlanId(planId);
            setSelectedChangeRequestId(null);
            setCurrentPage("coach-plan-review");
          }}
          onViewTraineeProfile={(traineeId) => {
            setSelectedTraineeId(traineeId);
            setCurrentPage("coach-trainee-profile");
          }}
        />
        {content}
      </div>
    );
  }

  // ─── Public pages (no auth required, no nav) ──────────────────────────────

  if (currentPage === "welcome") {
    return (
      <WelcomePage
        onLogin={() => setCurrentPage("login")}
        onRegister={() => setCurrentPage("register")}
      />
    );
  }

  if (currentPage === "login") {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setCurrentPage("register")}
        onBackToWelcome={() => setCurrentPage("welcome")}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <RegisterPage
        onGoToLogin={() => setCurrentPage("login")}
        onBackToWelcome={() => setCurrentPage("welcome")}
      />
    );
  }

  if (currentPage === "trainee-onboarding") {
    return (
      <TraineeOnboardingPage
        onComplete={() => {
          setOnboardingComplete();
          setCurrentPage("dashboard");
        }}
      />
    );
  }

  // ─── Authenticated pages (with nav) ──────────────────────────────────────

  // Guard: redirect unauthenticated users
  if (!user) {
    setCurrentPage("welcome");
    return <LoadingScreen />;
  }

  if (currentPage === "profile") {
    return withNav(<UserProfilePage onLogout={handleLogout} />);
  }

  if (currentPage === "settings") {
    return withNav(
      <SettingsPage onGoToProfile={() => setCurrentPage("profile")} />
    );
  }

  if (currentPage === "notifications") {
    return withNav(
      <NotificationPage
        onChangePage={(page) => setCurrentPage(page)}
        onReviewPlan={(planId) => {
          setSelectedPlanId(planId);
          setSelectedChangeRequestId(null);
          setCurrentPage("coach-plan-review");
        }}
        onViewTraineeProfile={(traineeId) => {
          setSelectedTraineeId(traineeId);
          setCurrentPage("coach-trainee-profile");
        }}
      />
    );
  }

  if (currentPage === "chat") {
    return withNav(<BotChatPage />);
  }

  if (currentPage === "dashboard") {
    return withNav(<ProgressDashboardPage onChangePage={setCurrentPage} />);
  }

  if (currentPage === "workout") {
    return withNav(
      <WorkoutPage
        onGoToPlansHistory={() => setCurrentPage("workout-history")}
        onSelectPlan={(planId) => {
          setSelectedWorkoutPlanId(planId);
          setCurrentPage("generated-workout-plan-details");
        }}
      />
    );
  }

  if (
    currentPage ==="generated-workout-plan-details") {
    if (!selectedWorkoutPlanId) {
      return withNav(
        <main className="mx-auto max-w-4xl px-6 py-10">
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-bold text-red-800">
              Workout plan not selected
            </h1>

            <button
              type="button"
              onClick={() =>
                setCurrentPage("workout")
              }
              className="mt-4 rounded-2xl bg-purple-600 px-4 py-2 text-sm font-bold text-white"
            >
              Back to workouts
            </button>
          </section>
        </main>,
        "workout"
      );
    }

    return withNav(
      <GeneratedWorkoutPlanDetailsPage
        planId={selectedWorkoutPlanId}
        onBack={() => {
          setSelectedWorkoutPlanId(null);
          setCurrentPage("workout");
        }}
      />,
      "workout"
    );
  }




  if (currentPage === "workout-history") {
    return withNav(
      <WorkoutHistoryPage
        onBack={() => setCurrentPage("workout")}
        onSelectPlan={(planId) => {
          setSelectedWorkoutPlanId(planId);
          setCurrentPage("generated-workout-plan-details");
        }}
      />,
      "workout"
    );
  }

  if (currentPage === "coach-dashboard") {
    return withNav(
      <CoachDashboardPage
        onChangePage={(page) => setCurrentPage(page)}
        onReviewPlan={(planId) => {
          setSelectedPlanId(planId);
          setSelectedChangeRequestId(null);
          setCurrentPage("coach-plan-review");
        }}
        onViewTraineeProfile={(traineeId) => { setSelectedTraineeId(traineeId); setCurrentPage("coach-trainee-profile"); }}
      />
    );
  }

  if (currentPage === "coach-trainees") {
    return withNav(
      <TraineeListPage
        onViewTraineeProfile={(traineeId) => { setSelectedTraineeId(traineeId); setCurrentPage("coach-trainee-profile"); }}
      />
    );
  }

  if (currentPage === "coach-trainee-profile") {
    return withNav(
      <TraineeDetailsPage
        selectedTraineeId={selectedTraineeId}
        onChangePage={(page) => setCurrentPage(page)}
        onReviewPlan={(planId) => {
          setSelectedPlanId(planId);
          setSelectedChangeRequestId(null);
          setCurrentPage("coach-plan-review");
        }}
      />,
      "coach-trainees"
    );
  }

  if (currentPage === "coach-plans") {
    return withNav(
      <PlanListPage
        onChangePage={(page) => setCurrentPage(page)}
        onReviewPlan={(planId) => {
          setSelectedPlanId(planId);
          setSelectedChangeRequestId(null);
          setCurrentPage("coach-plan-review");
        }}
        onReviewPlanFromRequest={(planId, changeRequestId) => {
          setSelectedPlanId(planId);
          setSelectedChangeRequestId(changeRequestId);
          setCurrentPage("coach-plan-review");
        }}
      />
    );
  }

  if (currentPage === "coach-plan-review") {
    return withNav(
      <PlanReviewPage
        selectedPlanId={selectedPlanId}
        changeRequestId={selectedChangeRequestId}
        onChangePage={(page) => {
          setSelectedChangeRequestId(null);
          setCurrentPage(page);
        }}
      />,
      "coach-plans"
    );
  }

  // ─── Placeholder for pages not yet implemented ────────────────────────────

  if (isMainAppPage) {
    return withNav(
      <main className="p-8">
        <h1 className="text-3xl font-bold capitalize">{currentPage} — Coming Soon</h1>
        <p className="mt-2 text-slate-500">This page is not yet implemented.</p>
      </main>
    );
  }

  return null;
}

export default App;
