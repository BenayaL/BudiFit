import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../app/AuthContext";
import { dailyWorkoutService } from "./dailyWorkoutService";
import type { DailyDashboard } from "./dailyWorkout.models";

function getLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface UseDailyWorkoutResult {
  dashboard: DailyDashboard | null;
  isLoading: boolean;
  isCompleting: boolean;
  error: string;
  completeToday: () => Promise<boolean>;
  refresh: () => void;
}

export function useDailyWorkout(): UseDailyWorkoutResult {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<DailyDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const data = await dailyWorkoutService.getDashboard(token);
      setDashboard(data);
    } catch (err) {
      console.error("[DAILY] Failed to load dashboard:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load daily workout info."
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const completeToday = useCallback(async (): Promise<boolean> => {
    if (!token || !dashboard?.activePlan) return false;
    const todayStr = getLocalDateString();

    // Optimistic update: apply immediately, rollback on failure
    const prev = dashboard;
    setIsCompleting(true);
    setError("");

    // Snapshot before optimistic change
    setDashboard((d) => {
      if (!d) return d;
      return {
        ...d,
        streak: d.streak + 1,
        today: {
          ...d.today,
          // placeholder until server confirms
          completion: { id: "__optimistic__", completedAt: new Date().toISOString() },
        },
      };
    });

    try {
      const result = await dailyWorkoutService.completeWorkout(
        dashboard.activePlan.id,
        todayStr,
        token
      );
      // Replace optimistic placeholder with real server data
      setDashboard((d) => {
        if (!d) return d;
        return {
          ...d,
          today: {
            ...d.today,
            completion: { id: result.id, completedAt: result.completedAt },
          },
        };
      });
      return true;
    } catch (err) {
      // Rollback to snapshot before optimistic update
      setDashboard(prev);
      setError(
        err instanceof Error ? err.message : "Failed to mark workout as done."
      );
      return false;
    } finally {
      setIsCompleting(false);
    }
  }, [token, dashboard]);

  return {
    dashboard,
    isLoading,
    isCompleting,
    error,
    completeToday,
    refresh: () => void load(),
  };
}
