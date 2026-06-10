// app — global auth state: token and real CurrentUser from the server.
// Stored token in localStorage/sessionStorage so the session survives a page refresh.
// On mount, the stored token is validated by calling GET /api/users/me.

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type { CurrentUser, AuthResponse } from "../features/userManagement/user.models";
import { userService } from "../features/userManagement/userService";

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = "budifit_auth";

function loadStoredToken(): string | null {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      sessionStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    // Migrate old format: was a JSON object with a `token` field
    try {
      const parsed = JSON.parse(raw) as { token?: string };
      return parsed.token ?? null;
    } catch {
      // Already a raw token string (new format)
      return raw;
    }
  } catch {
    return null;
  }
}

function saveToken(token: string, rememberMe: boolean): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    sessionStorage.setItem(STORAGE_KEY, token);
  }
}

function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

// ─── Context types ────────────────────────────────────────────────────────────

interface AuthContextValue {
  token: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (response: AuthResponse, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  updateCurrentUser: (updated: Partial<CurrentUser>) => void;
  setOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // On mount: restore the session from storage
  useEffect(() => {
    const storedToken = loadStoredToken();

    if (!storedToken) {
      setIsInitializing(false);
      return;
    }

    setToken(storedToken);

    userService
      .getCurrentUser(storedToken)
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        // Token is invalid or expired — clear the stale session
        clearToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const login = useCallback(
    async (response: AuthResponse, rememberMe: boolean): Promise<void> => {
      const newToken = response.token;

      saveToken(newToken, rememberMe);
      setToken(newToken);

      try {
        const currentUser = await userService.getCurrentUser(newToken);
        setUser(currentUser);
      } catch {
        // Login succeeded but /me failed (server error).
        // Keep the token — the user can still navigate; session restore will retry.
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (token) {
        await userService.logout(token);
      }
    } catch {
      // Network error — proceed with local cleanup regardless
    } finally {
      clearToken();
      setToken(null);
      setUser(null);
    }
  }, [token]);

  const refreshCurrentUser = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const currentUser = await userService.getCurrentUser(token);
      setUser(currentUser);
    } catch {
      // Silently fail — caller can handle the stale state
    }
  }, [token]);

  const updateCurrentUser = useCallback(
    (updated: Partial<CurrentUser>): void => {
      setUser((prev) => (prev ? { ...prev, ...updated } : null));
    },
    []
  );

  const setOnboardingComplete = useCallback((): void => {
    setUser((prev) =>
      prev ? { ...prev, hasCompletedOnboarding: true } : null
    );
  }, []);

  const value: AuthContextValue = {
    token,
    user,
    isAuthenticated: token !== null,
    isInitializing,
    login,
    logout,
    refreshCurrentUser,
    updateCurrentUser,
    setOnboardingComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
