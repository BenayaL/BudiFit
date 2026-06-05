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
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
  updateDisplayInfo: (displayName: string, streak: number) => void;
}

const STORAGE_KEY = "budifit_auth";

function loadFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthState;
  } catch {
    // corrupted — start fresh
  }
  return { token: null, userId: null, role: null, displayName: "", streak: 0 };
}

function saveToStorage(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadFromStorage);

  const login = useCallback((response: AuthResponse) => {
    const next: AuthState = {
      token: response.token,
      userId: response.userId,
      role: response.role,
      displayName: "",
      streak: 0,
    };
    saveToStorage(next);
    setAuth(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ token: null, userId: null, role: null, displayName: "", streak: 0 });
  }, []);

  const updateDisplayInfo = useCallback((displayName: string, streak: number) => {
    setAuth((prev) => {
      const next = { ...prev, displayName, streak };
      saveToStorage(next);
      return next;
    });
  }, []);

  const value: AuthContextValue = {
    ...auth,
    isAuthenticated: auth.token !== null,
    login,
    logout,
    updateDisplayInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
