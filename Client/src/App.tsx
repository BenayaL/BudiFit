// useState allows the App component to remember which page is currently active.
import { useState } from "react";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import type { Page } from "./types/AppTypes";

// Import the top navigation component and its NavItem type.
import TopNav, { type NavItem } from "./components/layout/TopNav";

/**
 * App component
 *
 * This is the root component of the client-side application.
 * Its current responsibility is to decide which page should be displayed.
 *
 * For now, we are using simple state-based navigation.
 * Later, this can be replaced with React Router.
 */
function App() {
  /**
   * currentPage stores the current screen of the app.
   *
   * Initial value is "welcome" because the user should first see
   * the welcome screen before login/register.
   */
  const [currentPage, setCurrentPage] = useState<Page>("welcome");

  /**
   * Dummy user data for testing the TopNav.
   *
   * Later, this data will probably come from the logged-in user
   * that we receive from the backend or from auth state.
   */
  const dummyUser = {
    name: "Julian",
    streak: 14,
  };

  /**
   * Icon helper component
   *
   * This small component receives an SVG path and returns an icon.
   * It keeps the navItems array cleaner and avoids repeating the
   * full SVG structure many times.
   */
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

  /**
   * navItems defines the links that appear in the TopNav.
   *
   * Important:
   * Every id here must exist inside the Page type in AppTypes.ts.
   * Otherwise TypeScript will show an error.
   */
  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      ),
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
      icon: <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
    },
  ];

  /**
   * mainAppPages contains the pages that should be displayed
   * inside the main app layout with TopNav.
   *
   * Welcome, login, and register are not included because they are
   * public/auth pages and should not show the main navigation.
   */
  const mainAppPages: Page[] = [
    "home",
    "chat",
    "workout",
    "dashboard",
    "profile",
    "social",
    "notifications",
    "export",
  ];

  /**
   * isMainAppPage checks whether the current page belongs to
   * the logged-in area of the application.
   */
  const isMainAppPage = mainAppPages.includes(currentPage);

  /**
   * Welcome page
   *
   * This is the first page the user sees.
   * It allows the user to move to login or register.
   */
  if (currentPage === "welcome") {
    return (
      <WelcomePage
        onLogin={() => setCurrentPage("login")}
        onRegister={() => setCurrentPage("register")}
      />
    );
  }

  /**
   * Login page
   *
   * This replaces the temporary login placeholder.
   *
   * onLoginSuccess currently moves the user to the dashboard.
   * Later, after connecting to the backend, this function will run
   * only after the server confirms that the login details are valid.
   */
  if (currentPage === "login") {
    return (
      <LoginPage
        onLoginSuccess={() => setCurrentPage("dashboard")}
        onGoToRegister={() => setCurrentPage("register")}
        onBackToWelcome={() => setCurrentPage("welcome")}
      />
    );
  }

  /**
   * Register page placeholder
   *
   * Later we will replace this div with a real RegisterPage component.
   */
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

  /**
   * Main app layout
   *
   * All pages after login use the TopNav.
   * For now, each page shows simple placeholder content.
   * Later, each page can be replaced with a real component.
   */
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

  /**
   * Fallback return
   *
   * This is here in case currentPage has a value that is not handled yet.
   */
  return null;
}

export default App;