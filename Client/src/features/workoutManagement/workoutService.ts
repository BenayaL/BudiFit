// workoutManagement — service layer for workout API calls.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";

import type {
  Workout,
  GeneratedWorkoutPlan,
  GeneratedWorkoutPlanResponse,
  GeneratedWorkoutPlansResponse,
  GenerateWorkoutPlanResponse,
} from "./workout.models";

export const workoutService = {
  /*
   * Existing scheduled-workout endpoints.
   */
  getWorkouts: (
    token: string
  ): Promise<Workout[]> =>
    httpClient.get<Workout[]>(
      ENDPOINTS.workouts.list,
      token
    ),

  getWorkoutById: (
    workoutId: string,
    token: string
  ): Promise<Workout> =>
    httpClient.get<Workout>(
      ENDPOINTS.workouts.details(workoutId),
      token
    ),

  completeWorkout: (
    workoutId: string,
    token: string
  ): Promise<void> =>
    httpClient.post<void>(
      ENDPOINTS.workouts.complete(workoutId),
      {},
      token
    ),

  /*
   * Generate a personalized plan using the trainee profile
   * stored on the server.
   */
  async generateWorkoutPlan(token: string
  ): Promise<GeneratedWorkoutPlan> {
    const response =
      await httpClient.post<
        GenerateWorkoutPlanResponse,
        Record<string, never>
      >(
        ENDPOINTS.generatedWorkoutPlans.generate,
        {},
        token
      );

    return response.plan;
  },

  /*
   * Load all generated plans belonging to the logged-in trainee.
   */
  async getGeneratedWorkoutPlans(
    token: string
  ): Promise<GeneratedWorkoutPlan[]> {
    const response =
      await httpClient.get<GeneratedWorkoutPlansResponse>(
        ENDPOINTS.generatedWorkoutPlans.list,
        token
      );

    return response.plans;
  },

  /*
   * Load one generated plan.
   */
  async getGeneratedWorkoutPlanById(
    planId: string,
    token: string
  ): Promise<GeneratedWorkoutPlan> {
    if (!planId.trim()) {
      throw new Error(
        "Workout plan ID is required"
      );
    }

    const response =
      await httpClient.get<GeneratedWorkoutPlanResponse>(
        ENDPOINTS.generatedWorkoutPlans.details(
          planId
        ),
        token
      );

    return response.plan;
  },
};