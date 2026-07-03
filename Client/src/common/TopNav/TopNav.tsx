import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import BudiLogo from "../BudiLogo/BudiLogo";
import { useTheme } from "../../app/useTheme";

import type { TopNavProps } from "./TopNav.types";

export function TopNav({
  items,
  activePage,
  onChangePage,
  user,
  onGoToProfile,
}: TopNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useLayoutEffect(() => {
    const updateIndicator = () => {
      if (window.innerWidth < 1024) return;
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav ref={navContainerRef} className="sticky top-0 z-50 px-4 sm:px-6 pt-4 backdrop-blur-md bg-[#fbfaf7]/85 dark:bg-[#141218]/85">
      <div className="flex items-center justify-between gap-3 rounded-[22px] border border-slate-200/50 bg-white p-2.5 shadow-sm dark:border-[#3B344A]/50 dark:bg-[#211D2B]">

        {/* Left — logo (never shrinks) */}
        <div className="shrink-0 pl-2 pr-1">
          <BudiLogo />
        </div>

        {/* Center — full tab nav, only at ≥1024px */}
        <div
          ref={navRef}
          className="hidden lg:flex relative justify-center gap-1 min-w-0"
        >
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
                  isActive
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-[#C9C4D6] dark:hover:text-white"
                }`}
              >
                {item.icon && (
                  <span className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 dark:text-[#9E97AF]"}`}>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right — theme toggle + hamburger (< 1024px only) + avatar (always) */}
        <div className="shrink-0 flex items-center gap-2 pr-1">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex items-center justify-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A] dark:focus-visible:ring-offset-[#211D2B]"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 shrink-0 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 shrink-0 text-purple-500" />
            )}
            <span className="hidden sm:inline">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6] dark:hover:bg-[#3B344A]"
          >
            {isMobileMenuOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={onGoToProfile}
            aria-label={`Go to profile — ${user.name}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white hover:bg-purple-700 transition-colors"
          >
            {user.avatarIcon ? (
              <span className="text-lg leading-none">{user.avatarIcon}</span>
            ) : (
              user.avatarLetter
            )}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#211D2B]" />
          </button>
        </div>
      </div>

      {/* Compact menu panel — only visible below 1024px when open */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-1 rounded-[18px] border border-slate-200/50 bg-white px-2 py-2 shadow-lg dark:border-[#3B344A]/50 dark:bg-[#211D2B]">
          {items.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChangePage(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    : "text-slate-600 hover:bg-slate-50 dark:text-[#C9C4D6] dark:hover:bg-[#2A2436]"
                }`}
              >
                {item.icon && (
                  <span className={`shrink-0 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-[#9E97AF]"}`}>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}

export default TopNav;
