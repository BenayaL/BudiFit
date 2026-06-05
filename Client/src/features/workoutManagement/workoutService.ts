// workoutManagement — service layer for workout API calls.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";
import type { Workout } from "./workout.models";

export const workoutService = {
  getWorkouts: (token: string): Promise<Workout[]> =>
    httpClient.get<Workout[]>(ENDPOINTS.workouts.list, token),

  getWorkoutById: (workoutId: string, token: string): Promise<Workout> =>
    httpClient.get<Workout>(ENDPOINTS.workouts.details(workoutId), token),

  completeWorkout: (workoutId: string, token: string): Promise<void> =>
    httpClient.post<void>(ENDPOINTS.workouts.complete(workoutId), {}, token),
};
