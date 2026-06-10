// coachManagement — service layer for coach, trainee, and plan API calls.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";
import type { Coach, Trainee, CoachPlan, CoachDashboardData } from "./coach.models";

export const coachService = {
  getCoachDashboard: (token: string): Promise<CoachDashboardData> =>
    httpClient.get<CoachDashboardData>(ENDPOINTS.coach.dashboard, token),

  getTrainees: (token: string): Promise<Trainee[]> =>
    httpClient.get<Trainee[]>(ENDPOINTS.coach.trainees, token),

  getTraineeById: (traineeId: string, token: string): Promise<Trainee> =>
    httpClient.get<Trainee>(ENDPOINTS.coach.traineeDetails(traineeId), token),

  getPlans: (token: string): Promise<CoachPlan[]> =>
    httpClient.get<CoachPlan[]>(ENDPOINTS.coach.plans, token),

  getPlanById: (planId: string, token: string): Promise<CoachPlan> =>
    httpClient.get<CoachPlan>(ENDPOINTS.coach.planDetails(planId), token),

  approvePlan: (planId: string, token: string): Promise<void> =>
    httpClient.patch<void>(ENDPOINTS.coach.approvePlan(planId), {}, token),

  rejectPlan: (planId: string, token: string): Promise<void> =>
    httpClient.patch<void>(ENDPOINTS.coach.rejectPlan(planId), {}, token),

  getCoachProfile: (token: string): Promise<Coach> =>
    httpClient.get<Coach>(ENDPOINTS.auth.currentUser, token),
};
