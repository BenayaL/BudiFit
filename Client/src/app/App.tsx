import { useState } from "react";

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
import WorkoutListPage from "../features/workoutManagement/WorkoutList/WorkoutListPage";

// common
import TopNav from "../common/TopNav/TopNav";

// app
import type { Page } from "./app.types";
import { coachPages, traineePages } from "./routes";
import { coachNavItems, traineeNavItems } from "./navigation";
import { useAuth } from "./AuthContext";

function App() {
  const { role, displayName, streak, logout } = useAuth();

  const [currentPage, setCurrentPage] = useState<Page>("welcome");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);

  const currentRole = role ?? "trainee";
  const activeNavItems = currentRole === "coach" ? coachNavItems : traineeNavItems;
  const visiblePages = currentRole === "coach" ? coachPages : traineePages;
  const isMainAppPage = visiblePages.includes(currentPage);

  // TopNav expects { name, streak }. After profile loads, displayName is set via updateDisplayInfo.
  const navUser = { name: displayName || "You", streak };

  function handleLoginSuccess(loginRole: "trainee" | "coach") {
    setCurrentPage(loginRole === "coach" ? "coach-dashboard" : "dashboard");
  }

  function handleRegisterSuccess(regRole: "trainee" | "coach") {
    setCurrentPage(regRole === "coach" ? "coach-dashboard" : "dashboard");
  }

  function handleLogout() {
    logout();
    setCurrentPage("welcome");
  }

  function withNav(content: React.ReactNode, activePage: Page = currentPage) {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <TopNav
          items={activeNavItems}
          activePage={activePage}
          onChangePage={(page) => setCurrentPage(page)}
          user={navUser}
          onStartWorkout={() => setCurrentPage("workout")}
          onLogout={handleLogout}
        />
        {content}
      </div>
    );
  }

  // ─── Public pages (no nav) ────────────────────────────────────────────────

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
        onRegisterSuccess={handleRegisterSuccess}
        onGoToLogin={() => setCurrentPage("login")}
        onBackToWelcome={() => setCurrentPage("welcome")}
      />
    );
  }

  // ─── Authenticated pages (with nav) ──────────────────────────────────────

  if (currentPage === "profile") {
    return withNav(<UserProfilePage />);
  }

  if (currentPage === "chat") {
    return withNav(<BotChatPage />);
  }

  if (currentPage === "dashboard") {
    return withNav(<ProgressDashboardPage />);
  }

  if (currentPage === "workout") {
    return withNav(<WorkoutListPage />);
  }

  if (currentPage === "coach-dashboard") {
    return withNav(
      <CoachDashboardPage
        onChangePage={(page) => setCurrentPage(page)}
        onReviewPlan={(planId) => { setSelectedPlanId(planId); setCurrentPage("coach-plan-review"); }}
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
        onReviewPlan={(planId) => { setSelectedPlanId(planId); setCurrentPage("coach-plan-review"); }}
      />,
      "coach-trainees"
    );
  }

  if (currentPage === "coach-plans") {
    return withNav(
      <PlanListPage
        onChangePage={(page) => setCurrentPage(page)}
        onReviewPlan={(planId) => { setSelectedPlanId(planId); setCurrentPage("coach-plan-review"); }}
      />
    );
  }

  if (currentPage === "coach-plan-review") {
    return withNav(
      <PlanReviewPage
        selectedPlanId={selectedPlanId}
        onChangePage={(page) => setCurrentPage(page)}
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
