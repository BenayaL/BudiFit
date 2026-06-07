import { useState, useEffect } from "react";
import type { ProgressSummary } from "../progress.models";
import { progressService } from "../progressService";
import { useAuth } from "../../../app/AuthContext";

export function useProgressDashboard() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await progressService.getProgressDashboard(token);
        setSummary(data);
      } catch (err) {
        console.error("[PROGRESS] Failed to load progress dashboard:", err);
        setError("Failed to load progress data.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { summary, isLoading, error };
}
