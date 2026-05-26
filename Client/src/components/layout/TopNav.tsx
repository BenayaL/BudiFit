import { useLayoutEffect, useRef, useState } from "react";
import { BudiLogo } from "../Logo/BudiLogo";
import { AppButton } from "../ui/AppButton";
import type { Page } from "../../types/AppTypes"; // Adjust path as needed

// 1. Define the shape of a single navigation link
export type NavItem = {
  id: Page;
  label: string;
  icon?: React.ReactNode; // You can pass your SVGs here
};

// 2. Define exactly what data the TopNav expects to receive
export type TopNavProps = {
  items: NavItem[];
  activePage: Page;
  onChangePage: (page: Page) => void;
  user: {
    name: string;
    streak: number;
    // We can add more properties here later as your backend grows
  };
  onStartWorkout: () => void;
  onLogout: () => void;
};

export function TopNav({
  items,
  activePage,
  onChangePage,
  user,
  onStartWorkout,
  onLogout,
}: TopNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  
  // State for the animated sliding background pill
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  // 3. Logic to move the sliding pill behind the active tab
  useLayoutEffect(() => {
    if (!navRef.current) return;
    
    // Find the currently clicked button
    const activeBtn = navRef.current.querySelector(`[data-nav="${activePage}"]`);
    if (!activeBtn) return;
    
    const navRect = navRef.current.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    
    setIndicator({
      left: btnRect.left - navRect.left,
      width: btnRect.width,
      opacity: 1,
    });
  }, [activePage]);

  return (
    <nav className="sticky top-0 z-10 px-6 pt-4 backdrop-blur-md bg-[#fbfaf7]/85">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[22px] border border-slate-200/50 bg-white p-2.5 shadow-sm">
        
        {/* Left: Brand Logo */}
        <div className="pl-2 pr-3">
          <BudiLogo />
        </div>

        {/* Center: Navigation Links */}
        <div ref={navRef} className="relative flex justify-center gap-1">
          {/* Animated Sliding Background */}
          <div
            className="absolute bottom-0 top-0 z-0 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-md transition-all duration-300 ease-out"
            style={{
              left: indicator.left,
              width: indicator.width,
              opacity: indicator.opacity,
            }}
          />
          
          {items.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                data-nav={item.id}
                onClick={() => onChangePage(item.id)}
                className={`relative z-10 flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {/* Render the icon if it exists */}
                {item.icon && <span className={`${isActive ? "text-white" : "text-slate-400"}`}>{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right: User Cluster & Actions */}
        <div className="flex items-center gap-2 pr-1">
          {/* Streak Badge */}
          <div
            className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-2 text-sm font-bold text-purple-800"
            title="Day streak"
          >
            🔥 {user.streak}d
          </div>

          {/* Start Button with Play Icon */}
          {activePage !== "workout" && (
            <AppButton onClick={onStartWorkout} variant="primary">
              <div className="flex items-center gap-2 text-[13px]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Start
              </div>
            </AppButton>
          )}

          {/* User Profile Menu */}
          <button
            onClick={onLogout}
            title="Profile/Logout"
            className="relative ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:bg-slate-100"
          >
            <span className="text-sm font-bold text-slate-800">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </button>
        </div>
      </div>
    </nav>
  );
}