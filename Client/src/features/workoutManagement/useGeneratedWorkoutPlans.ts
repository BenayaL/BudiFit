import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../app/AuthContext";
import type { GeneratedWorkoutPlanSummary } from "./workout.models";
import { workoutService } from "./workoutService";

type ActionType = "complete" | "remove" | "replace" | null;

interface UseGeneratedWorkoutPlansResult {
  plans: GeneratedWorkoutPlanSummary[];
  isLoading: boolean;
  isGenerating: boolean;
  actionPlanId: string | null;
  actionType: ActionType;
  error: string | null;
  loadPlans: () => Promise<void>;
  generatePlan: () => Promise<GeneratedWorkoutPlanSummary | null>;
  completePlan: (planId: string) => Promise<void>;
  removePlan: (planId: string) => Promise<void>;
  replacePlan: (planId: string, reason: string) => Promise<void>;
  requestChange: (planId: string, message: string) => Promise<void>;
  clearError: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as Record<string, string>).message;
  }
  return "Something went wrong";
}

export function useGeneratedWorkoutPlans(): UseGeneratedWorkoutPlansResult {
  const { token } = useAuth();
  const [plans, setPlans] = useState<GeneratedWorkoutPlanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionPlanId, setActionPlanId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    if (!token) {
      setPlans([]);
      setError("You must be logged in to view workout plans.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedPlans = await workoutService.getGeneratedWorkoutPlans(token);
      setPlans(loadedPlans);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const generatePlan = useCallback(
    async (): Promise<GeneratedWorkoutPlanSummary | null> => {
      if (!token) {
        setError("You must be logged in to generate a workout plan.");
        return null;
      }

      if (isGenerating) return null;

      setIsGenerating(true);
      setError(null);

      try {
        const generatedPlan = await workoutService.generateWorkoutPlan(token);

        setPlans((current) => {
          if (current.some((p) => p.id === generatedPlan.id)) return current;
          return [generatedPlan, ...current];
        });

        return generatedPlan;
      } catch (err) {
        setError(getErrorMessage(err));
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [token, isGenerating]
  );

  const completePlan = useCallback(
    async (planId: string) => {
      if (!token) return;
      setActionPlanId(planId);
      setActionType("complete");
      setError(null);
      try {
        await workoutService.completePlan(planId, token);
        await loadPlans();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setActionPlanId(null);
        setActionType(null);
      }
    },
    [token, loadPlans]
  );

  const removePlan = useCallback(
    async (planId: string) => {
      if (!token) return;
      setActionPlanId(planId);
      setActionType("remove");
      setError(null);
      try {
        await workoutService.removePlan(planId, token);
        await loadPlans();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setActionPlanId(null);
        setActionType(null);
      }
    },
    [token, loadPlans]
  );

  const replacePlan = useCallback(
    async (planId: string, reason: string) => {
      if (!token) return;
      setActionPlanId(planId);
      setActionType("replace");
      setError(null);
      try {
        await workoutService.replacePlan(planId, reason, token);
        await loadPlans();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setActionPlanId(null);
        setActionType(null);
      }
    },
    [token, loadPlans]
  );

  const requestChange = useCallback(
    async (planId: string, message: string): Promise<void> => {
      if (!token) throw new Error("You must be logged in.");
      await workoutService.requestChange(planId, message, token);
      await loadPlans();
    },
    [token, loadPlans]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  return {
    plans,
    isLoading,
    isGenerating,
    actionPlanId,
    actionType,
    error,
    loadPlans,
    generatePlan,
    completePlan,
    removePlan,
    replacePlan,
    requestChange,
    clearError,
  };
}

export default useGeneratedWorkoutPlans;
