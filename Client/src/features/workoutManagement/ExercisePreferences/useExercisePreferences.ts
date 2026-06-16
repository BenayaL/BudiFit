import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../app/AuthContext";
import { exercisePreferenceService } from "./exercisePreferenceService";
import type {
  ExercisePreference,
  ExercisePreferenceValue,
  ExercisePreferenceReason,
} from "./exercisePreference.models";

export function normalizeExerciseKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

interface UseExercisePreferencesResult {
  isLoading: boolean;
  error: string;
  getPreference: (exerciseName: string) => ExercisePreference | undefined;
  setPreference: (
    exerciseName: string,
    preference: ExercisePreferenceValue | null,
    reason?: ExercisePreferenceReason
  ) => Promise<boolean>;
}

export function useExercisePreferences(): UseExercisePreferencesResult {
  const { token } = useAuth();
  const [byKey, setByKey] = useState<Map<string, ExercisePreference>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    exercisePreferenceService
      .getAll(token)
      .then((prefs) => {
        setByKey(new Map(prefs.map((p) => [p.exerciseKey, p])));
      })
      .catch((err) => {
        console.error("[PREFS] Failed to load exercise preferences:", err);
        setError("Failed to load exercise preferences.");
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const getPreference = useCallback(
    (exerciseName: string) => byKey.get(normalizeExerciseKey(exerciseName)),
    [byKey]
  );

  const setPreference = useCallback(
    async (
      exerciseName: string,
      preference: ExercisePreferenceValue | null,
      reason?: ExercisePreferenceReason
    ): Promise<boolean> => {
      if (!token) return false;
      const key = normalizeExerciseKey(exerciseName);
      const prev = byKey;

      // Optimistic update
      setByKey((current) => {
        const next = new Map(current);
        if (preference === null) {
          next.delete(key);
        } else {
          next.set(key, {
            id: current.get(key)?.id ?? key,
            exerciseKey: key,
            exerciseName,
            preference,
            reason: preference === "disliked" ? reason : undefined,
          });
        }
        return next;
      });

      try {
        await exercisePreferenceService.set({ exerciseName, preference, reason }, token);
        return true;
      } catch (err) {
        console.error("[PREFS] Failed to update exercise preference:", err);
        setByKey(prev);
        setError(err instanceof Error ? err.message : "Failed to update preference.");
        return false;
      }
    },
    [token, byKey]
  );

  return { isLoading, error, getPreference, setPreference };
}
