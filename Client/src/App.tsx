// useState allows the App component to remember which page is currently active.
import { useState } from "react";
// Import the welcome page component.
import { WelcomePage } from "./pages/WelcomePage";
// Import the AppPage type.
// The "type" keyword means this import is used only for TypeScript typing.
import type { Page } from "./types/AppTypes";
import { TopNav, type NavItem } from "./components/layout/TopNav";

/**
 * App component
 *
 * This is the root component of the client side application.
 * Its current responsibility is to decide which page should be displayed.
 */
function App() {
  /**
   * currentPage stores the current screen of the app.
   *
   * Initial value is "welcome" because the user should first see
   * the welcome screen before login/register.
   */
  const [currentPage, setCurrentPage] = useState<Page>("welcome");

  // --- Dummy data to test the TopNav ---
  const dummyUser = {
    name: "Julian",
    streak: 14,
  };

  // SVG helper for clean code
  const Icon = ({ d }: { d: string }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );

  // Note: If you want to add more links (like "profile" or "chat"), 
  // you will need to add them to the 'Page' type in AppTypes.ts first!
  const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
    { id: "chat", label: "Chat", icon: <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
    { id: "workout", label: "Workout", icon: <Icon d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-1.6-.4-3.2.2-4.1 1.5l3.5 3.5L2.8 12.6c-.4.4-.4 1 0 1.4l7.2 7.2c.4.4 1 .4 1.4 0l1.4-1.4 3.5 3.5c1.3-.9 1.9-2.5 1.5-4.1z" /> },
    { id: "dashboard", label: "Dashboard", icon: <Icon d="M18 20V10M12 20V4M6 20v-6" /> },
    { id: "profile", label: "Profile", icon: <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /> },
    { id: "social", label: "Social", icon: <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /> },
    { id: "notifications", label: "Notifications", icon: <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /> },
    { id: "export", label: "Export", icon: <Icon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /> },
  ];


  /**
   * If the current page is welcome, display WelcomePage.
   *
   * We pass two functions as props:
   * onLogin changes the page to login.
   * onRegister changes the page to register.
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
   * Temporary login placeholder.
   *
   * Later we will replace this div with a real LoginPage component.
   */
  //if (currentPage === "login") {
  //  return (
  //    <div className="flex min-h-screen items-center justify-center">
  //      <h1 className="text-3xl font-bold">Login page soon</h1>
  //    </div>
  //  );
  //}
  if (currentPage === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <button onClick={() => setCurrentPage("dashboard")} className="text-purple-600 underline">
          Skip login and go to Dashboard
        </button>
      </div>
    );
  }

  /**
   * Temporary register placeholder.
   *
   * Later we will replace this div with a real RegisterPage component.
   */
  if (currentPage === "register") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">Register page soon</h1>
      </div>
    );
  }

  // --- Dashboard View (with TopNav) ---
  if (currentPage === "dashboard") {
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
        
        {/* The rest of your dashboard content will go here */}
        <main className="p-8">
          <h1 className="text-3xl font-bold">Dashboard Content Here</h1>
        </main>
      </div>
    );
  }

  /**
   * Fallback return.
   *
   * This is here in case currentPage has a value that is not handled yet.
   */
  return null;
}

export default App;