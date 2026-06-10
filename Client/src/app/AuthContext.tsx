// app — global auth state: token, role, display info.
// Stored in localStorage so the session survives a page refresh.
// All domain hooks read the token from here instead of receiving it as a prop.

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { UserRole } from "../features/userManagement/user.models";
import type { AuthResponse } from "../features/userManagement/user.models";

interface AuthState {
  token: string | null;
  userId: string | null;
  role: UserRole | null;
  displayName: string;
  streak: number;
  hasCompletedOnboarding: boolean;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (response: AuthResponse, rememberMe: boolean) => void;
  logout: () => void;
  updateDisplayInfo: (displayName: string, streak: number) => void;
  setOnboardingComplete: () => void;
}

const STORAGE_KEY = "budifit_auth";

const EMPTY_AUTH_STATE: AuthState = {
  token: null,
  userId: null,
  role: null,
  displayName: "",
  streak: 0,
  hasCompletedOnboarding: false,
};

function loadFromStorage(): AuthState {
  try {
    /*
     * localStorage is checked first because it represents
     * a remembered login.
     */
    const storedAuth =
      localStorage.getItem(STORAGE_KEY) ??
      sessionStorage.getItem(STORAGE_KEY);

    if (storedAuth) {
      return JSON.parse(storedAuth) as AuthState;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  return EMPTY_AUTH_STATE;
}

function saveToActiveStorage(state: AuthState) {
  if (localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return;
  }

  if (sessionStorage.getItem(STORAGE_KEY)) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadFromStorage);

const login = useCallback(
  (response: AuthResponse, rememberMe: boolean) => {
    const next: AuthState = {
      token: response.token,
      userId: response.userId,
      role: response.role,
      displayName: "",
      streak: 0,
      hasCompletedOnboarding:
        response.hasCompletedOnboarding ?? false,
    };

    /*
     * Remove an older session before choosing the new storage.
     */
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    setAuth(next);
  },
  []
);

  const logout = useCallback(() => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  setAuth(EMPTY_AUTH_STATE);
}, []);

  const updateDisplayInfo = useCallback((displayName: string, streak: number) => {
    setAuth((prev) => {
      const next = { ...prev, displayName, streak };
      saveToActiveStorage(next);  
      return next;
    });
  }, []);

  const setOnboardingComplete = useCallback(() => {
    setAuth((prev) => {
      const next = { ...prev, hasCompletedOnboarding: true };
      saveToActiveStorage(next);
      return next;
    });
  }, []);

  const value: AuthContextValue = {
    ...auth,
    isAuthenticated: auth.token !== null,
    login,
    logout,
    updateDisplayInfo,
    setOnboardingComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
