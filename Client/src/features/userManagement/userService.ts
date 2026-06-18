// userManagement — service layer for authentication and user API calls.
// Pages and hooks must not call fetch directly. Use this service instead.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";

import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CurrentUser,
  RegisterServerResponse,
  UserSettings,
  OnboardingRequest,
  OnboardingResponse,
  TraineeProfileResponse,
  CoachConnectionResponse,
} from "./user.models";

export type UpdateCurrentUserRequest = Partial<
  Pick<CurrentUser, "firstName" | "lastName" | "username" | "fitnessLevel" | "goals">
>;

export const userService = {
  /** Authenticate a user and receive a signed JWT. */
  login: (data: LoginRequest): Promise<AuthResponse> =>
    httpClient.post<AuthResponse, LoginRequest>(ENDPOINTS.auth.login, data),

  /** Create a new user account. Does not automatically log the user in. */
  register: (data: RegisterRequest): Promise<RegisterServerResponse> =>
    httpClient.post<RegisterServerResponse, RegisterRequest>(
      ENDPOINTS.auth.register,
      data
    ),

  /**
   * Inform the server of logout. The client must still discard the token
   * regardless of whether this request succeeds.
   */
  logout: (token: string): Promise<void> =>
    httpClient.post<void, Record<string, never>>(
      ENDPOINTS.auth.logout,
      {},
      token
    ),

  /**
   * Load the real user that owns the supplied JWT.
   * GET /api/users/me
   */
  getCurrentUser: (token: string): Promise<CurrentUser> =>
    httpClient.get<CurrentUser>(ENDPOINTS.auth.currentUser, token),

  /**
   * Update the authenticated user's editable profile fields.
   * PATCH /api/users/me
   */
  updateCurrentUser: (
    data: UpdateCurrentUserRequest,
    token: string
  ): Promise<CurrentUser> =>
    httpClient.patch<CurrentUser, UpdateCurrentUserRequest>(
      ENDPOINTS.users.updateMe,
      data,
      token
    ),

  /** PATCH /api/users/me/avatar */
  updateAvatar: (avatarIcon: string, token: string): Promise<CurrentUser> =>
    httpClient.patch<CurrentUser, { avatarIcon: string }>(
      ENDPOINTS.users.avatar,
      { avatarIcon },
      token
    ),

  /** GET /api/users/me/settings */
  getSettings: (token: string): Promise<UserSettings> =>
    httpClient.get<UserSettings>(ENDPOINTS.users.settings, token),

  /** PATCH /api/users/me/settings */
  updateSettings: (
    data: Partial<UserSettings>,
    token: string
  ): Promise<UserSettings> =>
    httpClient.patch<UserSettings, Partial<UserSettings>>(
      ENDPOINTS.users.settings,
      data,
      token
    ),

  /** GET /api/trainee-profiles/me */
  getTraineeProfile: (token: string): Promise<TraineeProfileResponse> =>
    httpClient.get<TraineeProfileResponse>(ENDPOINTS.traineeProfiles.me, token),

  /** PATCH /api/trainee-profiles/me */
  updateTraineeProfile: (
    data: OnboardingRequest,
    token: string
  ): Promise<OnboardingResponse> =>
    httpClient.patch<OnboardingResponse, OnboardingRequest>(
      ENDPOINTS.traineeProfiles.me,
      data,
      token
    ),

  /** POST /api/trainee-profiles/me/onboarding */
  submitOnboarding: (
    data: OnboardingRequest,
    token: string
  ): Promise<OnboardingResponse> =>
    httpClient.post<OnboardingResponse, OnboardingRequest>(
      ENDPOINTS.traineeProfiles.onboarding,
      data,
      token
    ),

  /** GET /api/coach-connections/me */
  getCoachConnection: (token: string): Promise<CoachConnectionResponse> =>
    httpClient.get<CoachConnectionResponse>(
      ENDPOINTS.coachConnections.me,
      token
    ),

  /** POST /api/coach-connections/connect */
  connectToCoach: (
    coachCode: string,
    token: string
  ): Promise<CoachConnectionResponse> =>
    httpClient.post<CoachConnectionResponse, { coachCode: string }>(
      ENDPOINTS.coachConnections.connect,
      { coachCode },
      token
    ),

  /** DELETE /api/coach-connections/me */
  disconnectFromCoach: (token: string): Promise<void> =>
    httpClient.delete<void>(ENDPOINTS.coachConnections.me, token),
};
