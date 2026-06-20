import { useState } from "react";

type Theme = "light" | "dark";

function getStoredTheme(): Theme {
  const saved = localStorage.getItem("theme");
  return saved === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  function setTheme(next: Theme) {
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", next);
    setThemeState(next);
  }

  return { theme, setTheme };
}
