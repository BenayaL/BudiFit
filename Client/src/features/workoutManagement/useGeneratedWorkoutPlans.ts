import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../app/AuthContext";

import type {
  GeneratedWorkoutPlan,
} from "./workout.models";

import { workoutService } from "./workoutService";

interface UseGeneratedWorkoutPlansResult {
  plans: GeneratedWorkoutPlan[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  loadPlans: () => Promise<void>;
  generatePlan: () => Promise<GeneratedWorkoutPlan | null>;
  clearError: () => void;
}

/*
 * Convert an unknown error into a message that can be
 * displayed safely in the UI.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong";
}

export function useGeneratedWorkoutPlans():
  UseGeneratedWorkoutPlansResult {
  const { token } = useAuth();

  const [plans, setPlans] = useState<
    GeneratedWorkoutPlan[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * Load all generated workout plans that belong
   * to the authenticated trainee.
   */
  const loadPlans = useCallback(async () => {
    if (!token) {
      setPlans([]);
      setError(
        "You must be logged in to view workout plans."
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedPlans =
        await workoutService.getGeneratedWorkoutPlans(
          token
        );

      setPlans(loadedPlans);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /*
   * Ask the server to create a personalized plan.
   *
   * The server loads the trainee profile and calls Gemini.
   */
  const generatePlan = useCallback(
    async (): Promise<GeneratedWorkoutPlan | null> => {
      if (!token) {
        setError(
          "You must be logged in to generate a workout plan."
        );
        return null;
      }

      if (isGenerating) {
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const generatedPlan =
          await workoutService.generateWorkoutPlan(
            token
          );

        setPlans((currentPlans) => {
          const planAlreadyExists =
            currentPlans.some(
              (plan) =>
                plan.id === generatedPlan.id
            );

          if (planAlreadyExists) {
            return currentPlans;
          }

          return [
            generatedPlan,
            ...currentPlans,
          ];
        });

        return generatedPlan;
      } catch (error) {
        setError(getErrorMessage(error));
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [token, isGenerating]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /*
   * Load the saved plans when the page using this hook mounts
   * or when the authentication token changes.
   */
  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  return {
    plans,
    isLoading,
    isGenerating,
    error,
    loadPlans,
    generatePlan,
    clearError,
  };
}

export default useGeneratedWorkoutPlans;

