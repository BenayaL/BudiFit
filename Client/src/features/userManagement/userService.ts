// userManagement — service layer for auth and user profile API calls.
// Pages and hooks must not call fetch directly. Use this service instead.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
} from "./user.models";

export const userService = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    httpClient.post<AuthResponse, LoginRequest>(ENDPOINTS.auth.login, data),

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    httpClient.post<AuthResponse, RegisterRequest>(ENDPOINTS.auth.register, data),

  logout: (token: string): Promise<void> =>
    httpClient.post<void>(ENDPOINTS.auth.logout, {}, token),

  getUserProfile: (token: string): Promise<UserProfile> =>
    httpClient.get<UserProfile>(ENDPOINTS.users.profile, token),

  updateUserProfile: (
    data: Partial<Pick<UserProfile, "firstName" | "lastName" | "goals">>,
    token: string
  ): Promise<UserProfile> =>
    httpClient.patch<UserProfile, typeof data>(ENDPOINTS.users.updateProfile, data, token),
};
