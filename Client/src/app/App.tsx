// app = application entry and routing
// App is the root component. It owns the current page state and decides which
// page to render. Later this state-based navigation can be replaced with React Router.

import { useState } from "react";

// features = domain modules, each matching a future backend microservice
import WelcomePage from "../features/welcome/pages/WelcomePage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ProfilePage from "../features/user/pages/ProfilePage";

// shared = reusable components used by several features
import TopNav, { type NavItem } from "../shared/layout/TopNav";

import type { Page } from "./app.types";
import { mainAppPages } from "./routes";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("welcome");

  const dummyUser = {
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

  const isMainAppPage = mainAppPages.includes(currentPage);

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
        onLoginSuccess={() => setCurrentPage("dashboard")}
        onGoToRegister={() => setCurrentPage("register")}
        onBackToWelcome={() => setCurrentPage("welcome")}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <RegisterPage
        onRegisterSuccess={() => setCurrentPage("dashboard")}
        onGoToLogin={() => setCurrentPage("login")}
        onBackToWelcome={() => setCurrentPage("welcome")}
      />
    );
  }

  if (currentPage === "profile") {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <TopNav
          items={navItems}
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

  if (isMainAppPage) {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <TopNav
          items={navItems}
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
