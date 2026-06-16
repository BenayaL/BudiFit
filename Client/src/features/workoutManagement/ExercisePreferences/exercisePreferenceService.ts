import { httpClient } from "../../../api/httpClient";
import { ENDPOINTS } from "../../../api/endpoints";
import type {
  ExercisePreference,
  SetExercisePreferenceBody,
} from "./exercisePreference.models";

export const exercisePreferenceService = {
  getAll: (token: string): Promise<ExercisePreference[]> =>
    httpClient.get<ExercisePreference[]>(ENDPOINTS.exercisePreferences.list, token),

  set: (body: SetExercisePreferenceBody, token: string): Promise<unknown> =>
    httpClient.put<unknown, SetExercisePreferenceBody>(
      ENDPOINTS.exercisePreferences.update,
      body,
      token
    ),
};
