import { useState, useEffect } from "react";
import type { DailyChallenge } from "../challenge.models";
import type { TodayChallengeState } from "./TodayChallenge.types";
import { challengeService } from "../challengeService";
import { useAuth } from "../../../app/AuthContext";

export function useTodayChallenge(): TodayChallengeState {
  const { token } = useAuth();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        // TODO: Connect to GET /api/challenges/today when the server endpoint is implemented.
        const data = await challengeService.getTodayChallenge(token);
        setChallenge(data);
      } catch (err) {
        console.error("[CHALLENGE] Failed to load today's challenge:", err);
        setError("Failed to load today's challenge.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { challenge, isLoading, error };
}
