// app = application entry and routing
// App is the root component. It owns the current page state and decides which
// page to render. Later this state-based navigation can be replaced with React Router.

import { useState } from "react";

// features = domain modules, each matching a future backend microservice
import WelcomePage from "../features/welcome/pages/WelcomePage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ProfilePage from "../features/user/pages/ProfilePage";
import CoachDashboardPage from "../features/coach/pages/CoachDashboardPage";
import CoachTraineesPage from "../features/coach/pages/CoachTraineesPage";
import CoachPlansPage from "../features/coach/pages/CoachPlansPage";
import CoachPlanReviewPage from "../features/coach/pages/CoachPlanReviewPage";
import CoachTraineeProfilePage from "../features/coach/pages/CoachTraineeProfilePage";

// shared = reusable components used by several features
import TopNav, { type NavItem } from "../common/layout/TopNav";

import type { Page } from "./app.types";
import { coachPages, traineePages } from "./routes";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("welcome");
  const [currentRole, setCurrentRole] = useState<"trainee" | "coach">("trainee");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);

  //remove dummyuser when userService is wired up and replace with real user data from context or a global store
  const dummyUser =
    currentRole === "coach"
      ? {
        name: "Yaniv",
        streak: 0,
      }
      : {
        name: "Julian",
        streak: 14,
      };

  // Small inline icon helper — keeps navItems readable without a separate file.
  const Icon = ({ d }: { d: string }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );

  const coachNavItems: NavItem[] = [
    {
      id: "coach-dashboard",
      label: "Coach",
      icon: (
        <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87" />
      ),
    },
    {
      id: "coach-trainees",
      label: "Trainees",
      icon: (
        <Icon d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      ),
    },
    {
      id: "coach-plans",
      label: "Plans",
      icon: (
        <Icon d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (
        <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      ),
    },
  ];

  // Every id must match a value in the Page union type (app.types.ts).
  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    },
    {
      id: "chat",
      label: "Chat",
      icon: (
        <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      ),
    },
    {
      id: "workout",
      label: "Workout",
      icon: (
        <Icon d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-1.6-.4-3.2.2-4.1 1.5l3.5 3.5L2.8 12.6c-.4.4-.4 1 0 1.4l7.2 7.2c.4.4 1 .4 1.4 0l1.4-1.4 3.5 3.5c1.3-.9 1.9-2.5 1.5-4.1z" />
      ),
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Icon d="M18 20V10M12 20V4M6 20v-6" />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      ),
    },
    {
      id: "social",
      label: "Social",
      icon: (
        <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (
        <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      ),
    },
    {
      id: "export",
      label: "Export",
      icon: (
        <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      ),
    },
  ];

  const activeNavItems = currentRole === "coach" ? coachNavItems : navItems;
  const visiblePages = currentRole === "coach" ? coachPages : traineePages;
  const isMainAppPage = visiblePages.includes(currentPage);

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
        onLoginSuccess={(role) => {
          setCurrentRole(role);
          setCurrentPage(role === "coach" ? "coach-dashboard" : "dashboard");
        }}
        onGoToRegister={() => setCurrentPage("register")}
        onBackToWelcome={() => setCurrentPage("welcome")}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <RegisterPage
        onRegisterSuccess={(role) => {
          setCurrentRole(role);
          setCurrentPage(role === "coach" ? "coach-dashboard" : "dashboard");
        }}
        onGoToLogin={() => setCurrentPage("login")}
        onBackToWelcome={() => setCurrentPage("welcome")}
      />
    );
  }

  if (currentPage === "profile") {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <TopNav
          items={activeNavItems}
          activePage={currentPage}
          onChangePage={(page) => setCurrentPage(page)}
          user={dummyUser}
          onStartWorkout={() => alert("Starting workout!")}
          onLogout={() => setCurrentPage("welcome")}
        />
        <ProfilePage />
      </div>
    );
  }

  if (currentPage === "coach-dashboard") {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <TopNav
          items={activeNavItems}
          activePage={currentPage}
          onChangePage={(page) => setCurrentPage(page)}
          user={dummyUser}
          onStartWorkout={() => alert("Coach action coming soon!")}
          onLogout={() => setCurrentPage("welcome")}
        />
        <CoachDashboardPage
          onChangePage={(page) => setCurrentPage(page)}
          onReviewPlan={(planId) => {
            setSelectedPlanId(planId);
            setCurrentPage("coach-plan-review");
          }}
          onViewTraineeProfile={(traineeId) => {
            setSelectedTraineeId(traineeId);
            setCurrentPage("coach-trainee-profile");
          }}
        />
      </div>
    );
  }

  if (currentPage === "coach-trainees") {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <TopNav
          items={activeNavItems}
          activePage={currentPage}
          onChangePage={(page) => setCurrentPage(page)}
          user={dummyUser}
          onStartWorkout={() => alert("Coach action coming soon!")}
          onLogout={() => setCurrentPage("welcome")}
        />

        <CoachTraineesPage
          onViewTraineeProfile={(traineeId) => {
            setSelectedTraineeId(traineeId);
            setCurrentPage("coach-trainee-profile");
          }}
        />
      </div>
    );
  }

  if (currentPage === "coach-trainee-profile") {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <TopNav
          items={activeNavItems}
          activePage="coach-trainees"
          onChangePage={(page) => setCurrentPage(page)}
          user={dummyUser}
          onStartWorkout={() => alert("Coach action coming soon!")}
          onLogout={() => setCurrentPage("welcome")}
        />

        <CoachTraineeProfilePage
          selectedTraineeId={selectedTraineeId}
          onChangePage={(page) => setCurrentPage(page)}
          onReviewPlan={(planId) => {
            setSelectedPlanId(planId);
            setCurrentPage("coach-plan-review");
          }}
        />
      </div>
    );
  }

  if (currentPage === "coach-plans") {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <TopNav
          items={activeNavItems}
          activePage={currentPage}
          onChangePage={(page) => setCurrentPage(page)}
          user={dummyUser}
          onStartWorkout={() => alert("Coach action coming soon!")}
          onLogout={() => setCurrentPage("welcome")}
        />

        <CoachPlansPage
          onChangePage={(page) => setCurrentPage(page)}
          onReviewPlan={(planId) => {
            setSelectedPlanId(planId);
            setCurrentPage("coach-plan-review");
          }}
        />
      </div>
    );
  }

  if (currentPage === "coach-plan-review") {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <TopNav
          items={activeNavItems}
          activePage="coach-plans"
          onChangePage={(page) => setCurrentPage(page)}
          user={dummyUser}
          onStartWorkout={() => alert("Coach action coming soon!")}
          onLogout={() => setCurrentPage("welcome")}
        />

        <CoachPlanReviewPage
          selectedPlanId={selectedPlanId}
          onChangePage={(page) => setCurrentPage(page)}
        />
      </div>
    );
  }

  if (isMainAppPage) {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <TopNav
          items={activeNavItems}
          activePage={currentPage}
          onChangePage={(page) => setCurrentPage(page)}
          user={dummyUser}
          onStartWorkout={() => alert("Starting workout!")}
          onLogout={() => setCurrentPage("welcome")}
        />

        <main className="p-8">
          <h1 className="text-3xl font-bold capitalize">
            {currentPage} Content Here
          </h1>

          <p className="mt-2 text-slate-500">
            This is a temporary placeholder for the {currentPage} page.
          </p>
        </main>
      </div>
    );
  }

  return null;
}

export default App;
