import { useState, useEffect } from "react";
import type { ProgressSummary } from "../progress.models";
import { progressService } from "../progressService";
import { useAuth } from "../../../app/AuthContext";

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
        // TODO: backend not connected yet — shows empty state
        console.warn("[DEV] getProgressDashboard failed — no fallback data.");
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { summary, isLoading, error };
}
