import { useLayoutEffect, useRef, useState } from "react";
import BudiLogo from "../Logo/BudiLogo";
import AppButton from "../ui/AppButton";
import type { Page } from "../../types/AppTypes"; // Adjust path as needed

/**
 * NavItem describes one navigation item in the top navbar.
 *
 * id - the page that this item navigates to.
 * label - the text shown to the user.
 * icon - optional React element shown next to the label.
 */
export interface NavItem {
  id: Page;
  label: string;
  icon?: React.ReactNode;
}

/**
 * TopNavProps describes the data and actions that TopNav receives from App.tsx.
 *
 * items - all navigation links to display.
 * activePage - the currently selected page.
 * onChangePage - function that changes the current page.
 * user - current logged-in user data used in the navbar.
 * onStartWorkout - function that starts / navigates to workout.
 * onLogout - function that logs the user out.
 */
export interface TopNavProps {
  items: NavItem[];
  activePage: Page;
  onChangePage: (page: Page) => void;
  user: {
    name: string;
    streak: number;
  };
  onStartWorkout: () => void;
  onLogout: () => void;
}

/**
 * TopNav component
 *
 * This is the main navigation bar for the logged-in area of the app.
 *
 * It contains:
 * - BudiFit logo
 * - Desktop navigation buttons
 * - Mobile/tablet dropdown navigation
 * - User streak
 * - Start workout button
 * - User avatar/logout button
 */
export function TopNav({
  items,
  activePage,
  onChangePage,
  user,
  onStartWorkout,
  onLogout,
}: TopNavProps) {
  /**
   * navRef points to the desktop navigation container.
   *
   * We need it because the purple active indicator must know
   * the exact position and width of the active button.
   */
  const navRef = useRef<HTMLDivElement>(null);

  /**
   * indicator stores the position and size of the purple active background.
   *
   * left - how far the indicator is from the left side of the nav container.
   * width - how wide the indicator should be.
   * opacity - hidden at first, then visible after measuring the active button.
   */
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  /**
   * isDropdownOpen controls the responsive dropdown menu.
   *
   * On smaller screens we cannot fit all nav items horizontally,
   * so we show a dropdown button instead.
   */
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /**
   * activeItem finds the full nav item object of the current page.
   *
   * If for some reason the active page is not found in items,
   * we fall back to the first item to avoid crashes.
   */
  const activeItem = items.find((item) => item.id === activePage) || items[0];

  /**
   * useLayoutEffect runs after React updates the DOM but before the browser paints.
   *
   * We use it here instead of useEffect because we are measuring real DOM sizes
   * with getBoundingClientRect().
   *
   * This prevents the indicator from visually jumping after the page has already painted.
   */
  useLayoutEffect(() => {
    /**
     * updateIndicator calculates where the purple active indicator should be.
     */
    const updateIndicator = () => {
      /**
       * The desktop nav is hidden under 1330px.
       * In that case we do not need to calculate the indicator position.
       */
      if (window.innerWidth < 1330) return;

      /**
       * If the nav container does not exist yet, stop.
       */
      if (!navRef.current) return;

      /**
       * Find the button that represents the active page.
       *
       * Each nav button has data-nav={item.id}.
       * This lets us find the correct button in the DOM.
       */
      const activeBtn = navRef.current.querySelector(
        `[data-nav="${activePage}"]`
      );

      /**
       * If no active button was found, stop.
       */
      if (!activeBtn) return;

      /**
       * Get the size and position of:
       * - the nav container
       * - the active button
       */
      const navRect = navRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();

      /**
       * Update the indicator so it sits exactly behind the active button.
       *
       * btnRect.left - navRect.left gives the button's position
       * relative to the nav container.
       */
      setIndicator({
        left: btnRect.left - navRect.left,
        width: btnRect.width,
        opacity: 1,
      });
    };

    /**
     * Calculate indicator position immediately after render.
     */
    updateIndicator();

    /**
     * Recalculate indicator when the window size changes.
     *
     * This matters because button positions can change on resize.
     */
    window.addEventListener("resize", updateIndicator);

    /**
     * Cleanup function.
     *
     * React runs this when the component unmounts or before the effect runs again.
     * It prevents memory leaks and duplicate event listeners.
     */
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activePage]);

  return (
    <nav className="sticky top-0 z-10 px-6 pt-4 backdrop-blur-md bg-[#fbfaf7]/85">
      {/** 
        Main navbar container.

        grid-cols-[auto_1fr_auto] creates 3 columns:
        1. auto - logo width
        2. 1fr - navigation takes remaining space
        3. auto - user actions width
      */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[22px] border border-slate-200/50 bg-white p-2.5 shadow-sm">
        {/* Left side - BudiFit logo */}
        <div className="pl-2 pr-3 shrink-0">
          <BudiLogo />
        </div>

        {/* Center area - desktop nav or responsive dropdown */}
        <div className="relative flex justify-center min-w-0">
          {/*
            Desktop navigation.

            hidden min-[1330px]:flex means:
            - hidden by default
            - becomes flex only when screen width is at least 1330px
          */}
          <div
            ref={navRef}
            className="hidden min-[1330px]:flex relative justify-center gap-1"
          >
            {/*
              Purple active indicator.

              This element moves behind the active nav button.
              Its position is controlled by the indicator state.
            */}
            <div
              className="absolute bottom-0 top-0 z-0 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-md transition-all duration-300 ease-out"
              style={{
                left: indicator.left,
                width: indicator.width,
                opacity: indicator.opacity,
              }}
            />

            {/*
              Render all navigation buttons from the items array.
            */}
            {items.map((item) => {
              /**
               * isActive tells us whether this item is the currently active page.
               */
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  data-nav={item.id}
                  onClick={() => onChangePage(item.id)}
                  className={`relative z-10 flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200 ${isActive
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  {/*
                    Optional item icon.

                    The icon color changes when the item is active.
                  */}
                  {item.icon && (
                    <span
                      className={`shrink-0 ${isActive ? "text-white" : "text-slate-400"
                        }`}
                    >
                      {item.icon}
                    </span>
                  )}

                  {item.label}
                </button>
              );
            })}
          </div>

          {/*
            Responsive navigation dropdown.

            flex min-[1330px]:hidden means:
            - visible by default
            - hidden when screen width is at least 1330px
          */}
          <div className="flex min-[1330px]:hidden relative w-full max-w-[200px] justify-center">
            {/*
              Dropdown trigger button.

              Shows the active page label and icon.
            */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {activeItem.icon && (
                  <span className="shrink-0 text-purple-600">
                    {activeItem.icon}
                  </span>
                )}

                <span className="truncate">{activeItem.label}</span>
              </div>

              {/*
                Chevron icon.

                It rotates when the dropdown is open.
              */}
              <svg
                className={`shrink-0 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/*
              Dropdown menu.

              It appears only when isDropdownOpen is true.
            */}
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-48 rounded-xl bg-white p-2 shadow-xl border border-slate-100 z-50">
                <div className="flex flex-col gap-1">
                  {items.map((item) => {
                    const isActive = activePage === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          /**
                           * Change the active page.
                           */
                          onChangePage(item.id);

                          /**
                           * Close the dropdown after choosing a page.
                           */
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActive
                            ? "bg-purple-50 text-purple-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                      >
                        {item.icon && (
                          <span
                            className={`shrink-0 ${isActive
                                ? "text-purple-600"
                                : "text-slate-400"
                              }`}
                          >
                            {item.icon}
                          </span>
                        )}

                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - user actions */}
        <div className="flex shrink-0 items-center gap-2 pr-1">
          {/*
            User streak badge.
            Shows how many days in a row the user completed activity.
          */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-purple-100 px-3 py-2 text-sm font-bold text-purple-800">
            🔥 {user.streak}d
          </div>

          {/*
            Start workout button.

            It is hidden when the user is already on the workout page.
          */}
          {activePage !== "workout" && (
            <div className="shrink-0">
              <AppButton
                onClick={onStartWorkout}
                variant="primary"
                className="!py-2.5 !px-4"
              >
                <div className="flex items-center gap-2 text-[13px]">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>

                  Start
                </div>
              </AppButton>
            </div>
          )}

          {/*
            User avatar / logout button.

            For now, clicking this button logs the user out.
            Later, it can open a user menu with Profile, Settings, Logout, etc.
          */}
          <button
            onClick={onLogout}
            className="shrink-0 relative ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:bg-slate-100"
          >
            {/*
              First letter of the user's name.
            */}
            <span className="text-sm font-bold text-slate-800">
              {user.name.charAt(0).toUpperCase()}
            </span>

            {/*
              Small green online status dot.
            */}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default TopNav;