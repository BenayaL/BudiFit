// useState allows the App component to remember which page is currently active.
import { useState } from "react";
// Import the welcome page component.
import { WelcomePage } from "./pages/WelcomePage";
// Import the AppPage type.
// The "type" keyword means this import is used only for TypeScript typing.
import type { Page } from "./types/AppTypes";

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
  if (currentPage === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-bold">Login page soon</h1>
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

  /**
   * Fallback return.
   *
   * This is here in case currentPage has a value that is not handled yet.
   */
  return null;
}

export default App;