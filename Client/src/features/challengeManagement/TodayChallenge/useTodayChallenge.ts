import { useState, useEffect } from "react";
import type { DailyChallenge } from "../challenge.models";
import type { TodayChallengeState } from "./TodayChallenge.types";
import { challengeService } from "../challengeService";
import { useAuth } from "../../../app/AuthContext";

export function useTodayChallenge(): TodayChallengeState {
  const { token } = useAuth();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const error = "";

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await challengeService.getTodayChallenge(token);
        setChallenge(data);
      } catch {
        // TODO: backend not connected yet — shows empty state
        console.warn("[DEV] getTodayChallenge failed — no fallback data.");
        setChallenge(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { challenge, isLoading, error };
}
