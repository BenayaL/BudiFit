// workoutManagement — service layer for workout API calls.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";

import type {
  Workout,
  GeneratedWorkoutPlan,
  GeneratedWorkoutPlanSummary,
  GeneratedWorkoutPlanResponse,
  GeneratedWorkoutPlansResponse,
  GenerateWorkoutPlanResponse,
  ExerciseAlternativesRequest,
  ExerciseAlternativesResponse,
} from "./workout.models";

export const workoutService = {
  /*
   * Existing scheduled-workout endpoints.
   */
  getWorkouts: (token: string): Promise<Workout[]> =>
    httpClient.get<Workout[]>(ENDPOINTS.workouts.list, token),

  getWorkoutById: (workoutId: string, token: string): Promise<Workout> =>
    httpClient.get<Workout>(ENDPOINTS.workouts.details(workoutId), token),

  completeWorkout: (workoutId: string, token: string): Promise<void> =>
    httpClient.post<void>(ENDPOINTS.workouts.complete(workoutId), {}, token),

  /*
   * Generate a personalized plan using the trainee profile stored on the server.
   */
  async generateWorkoutPlan(token: string): Promise<GeneratedWorkoutPlanSummary> {
    const response = await httpClient.post<
      GenerateWorkoutPlanResponse,
      Record<string, never>
    >(ENDPOINTS.generatedWorkoutPlans.generate, {}, token);
    return response.plan;
  },

  /*
   * Load all generated plans belonging to the logged-in trainee (summary DTOs).
   */
  async getGeneratedWorkoutPlans(token: string): Promise<GeneratedWorkoutPlanSummary[]> {
    const response = await httpClient.get<GeneratedWorkoutPlansResponse>(
      ENDPOINTS.generatedWorkoutPlans.list,
      token
    );
    return response.plans;
  },

  /*
   * Load plan history (completed + archived) belonging to the logged-in trainee.
   */
  async getPlanHistory(localDate: string, token: string): Promise<GeneratedWorkoutPlanSummary[]> {
    const response = await httpClient.get<GeneratedWorkoutPlansResponse>(
      ENDPOINTS.generatedWorkoutPlans.history(localDate),
      token
    );
    return response.plans;
  },

  /*
   * Load one generated plan (full DTO with days).
   */
  async getGeneratedWorkoutPlanById(planId: string, token: string): Promise<GeneratedWorkoutPlan> {
    if (!planId.trim()) {
      throw new Error("Workout plan ID is required");
    }
    const response = await httpClient.get<GeneratedWorkoutPlanResponse>(
      ENDPOINTS.generatedWorkoutPlans.details(planId),
      token
    );
    return response.plan;
  },

  completePlan: (planId: string, token: string): Promise<void> =>
    httpClient.post<void>(ENDPOINTS.generatedWorkoutPlans.complete(planId), {}, token),

  removePlan: (planId: string, token: string): Promise<void> =>
    httpClient.delete<void>(ENDPOINTS.generatedWorkoutPlans.remove(planId), token),

  permanentlyDeletePlan: (planId: string, token: string): Promise<void> =>
    httpClient.delete<void>(ENDPOINTS.generatedWorkoutPlans.permanentDelete(planId), token),

  async replacePlan(planId: string, reason: string, token: string): Promise<GeneratedWorkoutPlanSummary> {
    const response = await httpClient.post<
      GenerateWorkoutPlanResponse,
      { reason: string }
    >(ENDPOINTS.generatedWorkoutPlans.replace(planId), { reason }, token);
    return response.plan;
  },

  requestChange: (planId: string, message: string, token: string): Promise<void> =>
    httpClient.post<void>(
      ENDPOINTS.generatedWorkoutPlans.requestChange(planId),
      { message },
      token
    ),

  async getExerciseAlternatives(
    planId: string,
    body: ExerciseAlternativesRequest,
    token: string
  ): Promise<ExerciseAlternativesResponse> {
    return httpClient.post<ExerciseAlternativesResponse, ExerciseAlternativesRequest>(
      ENDPOINTS.generatedWorkoutPlans.exerciseAlternatives(planId),
      body,
      token
    );
  },
};
