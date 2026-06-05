import { useState, useEffect } from "react";
import type { ProgressSummary } from "../progress.models";
import { progressService } from "../progressService";
import { useAuth } from "../../../app/AuthContext";

// 1. Add this temporary fallback data
const FALLBACK_SUMMARY: ProgressSummary = {
  userId: "user-1",
  period: "all_time",
  totalWorkouts: 42,
  totalMinutes: 2520,
  currentStreak: 14,
  longestStreak: 21,
};

export function useProgressDashboard() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const error = "";

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await progressService.getProgressDashboard(token);
        setSummary(data);
      } catch {
        // 2. Change this from setSummary(null) to use the fallback!
        console.warn("[DEV] getProgressDashboard failed — using fallback data.");
        setSummary(FALLBACK_SUMMARY); 
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { summary, isLoading, error };
}