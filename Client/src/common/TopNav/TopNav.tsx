import { useLayoutEffect, useRef, useState } from "react";
import BudiLogo from "../BudiLogo/BudiLogo";
import AppButton from "../AppButton/AppButton";
import type { TopNavProps } from "./TopNav.types";

export function TopNav({
  items,
  activePage,
  onChangePage,
  user,
  onStartWorkout,
  onLogout,
}: TopNavProps) {
  const navRef = useRef<HTMLDivElement>(null);

  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeItem = items.find((item) => item.id === activePage) || items[0];

  useLayoutEffect(() => {
    const updateIndicator = () => {
      if (window.innerWidth < 1330) return;
      if (!navRef.current) return;

      const activeBtn = navRef.current.querySelector(`[data-nav="${activePage}"]`);
      if (!activeBtn) return;

      const navRect = navRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();

      setIndicator({ left: btnRect.left - navRect.left, width: btnRect.width, opacity: 1 });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activePage]);

  return (
    <nav className="sticky top-0 z-10 px-6 pt-4 backdrop-blur-md bg-[#fbfaf7]/85">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[22px] border border-slate-200/50 bg-white p-2.5 shadow-sm">
        {/* Left — logo */}
        <div className="pl-2 pr-3 shrink-0">
          <BudiLogo />
        </div>

        {/* Center — desktop nav or responsive dropdown */}
        <div className="relative flex justify-center min-w-0">
          {/* Desktop navigation (≥1330px) */}
          <div ref={navRef} className="hidden min-[1330px]:flex relative justify-center gap-1">
            <div
              className="absolute bottom-0 top-0 z-0 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-md transition-all duration-300 ease-out"
              style={{ left: indicator.left, width: indicator.width, opacity: indicator.opacity }}
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
                  {item.icon && (
                    <span className={`shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Responsive dropdown (<1330px) */}
          <div className="flex min-[1330px]:hidden relative w-full max-w-[200px] justify-center">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {activeItem.icon && (
                  <span className="shrink-0 text-purple-600">{activeItem.icon}</span>
                )}
                <span className="truncate">{activeItem.label}</span>
              </div>

              <svg
                className={`shrink-0 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 w-48 rounded-xl bg-white p-2 shadow-xl border border-slate-100 z-50">
                <div className="flex flex-col gap-1">
                  {items.map((item) => {
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onChangePage(item.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-purple-50 text-purple-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {item.icon && (
                          <span className={`shrink-0 ${isActive ? "text-purple-600" : "text-slate-400"}`}>
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

        {/* Right — user actions */}
        <div className="flex shrink-0 items-center gap-2 pr-1">
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-purple-100 px-3 py-2 text-sm font-bold text-purple-800">
            🔥 {user.streak}d
          </div>

          {activePage !== "workout" && (
            <div className="shrink-0">
              <AppButton onClick={onStartWorkout} variant="primary" className="!py-2.5 !px-4">
                <div className="flex items-center gap-2 text-[13px]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Start
                </div>
              </AppButton>
            </div>
          )}

          <button
            onClick={onLogout}
            className="shrink-0 relative ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:bg-slate-100"
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

export default TopNav;
