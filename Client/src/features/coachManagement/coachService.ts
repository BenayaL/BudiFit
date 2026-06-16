// coachManagement — service layer for coach, trainee, and plan API calls.

import { httpClient } from "../../api/httpClient";
import { ENDPOINTS } from "../../api/endpoints";
import type {
  Coach,
  Trainee,
  CoachPlan,
  CoachPlanUpdateBody,
  GeneratePlanForTraineeBody,
  CoachDashboardData,
  TraineeDetailsData,
  ChangeRequestsResponse,
  WorkoutPlanChangeRequest,
  CoachChangeRequestsResponse,
} from "./coach.models";

function getLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const coachService = {
  getCoachDashboard: (token: string): Promise<CoachDashboardData> =>
    httpClient.get<CoachDashboardData>(
      `${ENDPOINTS.coach.dashboard}?localDate=${getLocalDateString()}`,
      token
    ),

  getTrainees: (token: string): Promise<Trainee[]> =>
    httpClient.get<Trainee[]>(
      `${ENDPOINTS.coach.trainees}?localDate=${getLocalDateString()}`,
      token
    ),

  getTraineeById: (traineeId: string, token: string): Promise<TraineeDetailsData> =>
    httpClient.get<TraineeDetailsData>(
      `${ENDPOINTS.coach.traineeDetails(traineeId)}?localDate=${getLocalDateString()}`,
      token
    ),

  getPlans: (token: string): Promise<CoachPlan[]> =>
    httpClient.get<CoachPlan[]>(ENDPOINTS.coach.plans, token),

  getPlanById: (planId: string, token: string): Promise<CoachPlan> =>
    httpClient.get<CoachPlan>(ENDPOINTS.coach.planDetails(planId), token),

  updatePlan: (planId: string, body: CoachPlanUpdateBody, token: string): Promise<CoachPlan> =>
    httpClient.put<CoachPlan, CoachPlanUpdateBody>(ENDPOINTS.coach.updatePlan(planId), body, token),

  approvePlan: (planId: string, token: string): Promise<CoachPlan> =>
    httpClient.post<CoachPlan, Record<string, never>>(ENDPOINTS.coach.approvePlan(planId), {}, token),

  deletePlan: (planId: string, token: string): Promise<void> =>
    httpClient.delete<void>(ENDPOINTS.coach.deletePlan(planId), token),

  generatePlanForTrainee: (traineeId: string, body: GeneratePlanForTraineeBody, token: string): Promise<CoachPlan> =>
    httpClient.post<CoachPlan, GeneratePlanForTraineeBody>(ENDPOINTS.coach.generatePlanForTrainee(traineeId), body, token),

  getCoachProfile: (token: string): Promise<Coach> =>
    httpClient.get<Coach>(ENDPOINTS.auth.currentUser, token),

  async getTraineeChangeRequests(
    traineeId: string,
    token: string
  ): Promise<WorkoutPlanChangeRequest[]> {
    const response = await httpClient.get<ChangeRequestsResponse>(
      ENDPOINTS.coach.traineeChangeRequests(traineeId),
      token
    );
    return response.changeRequests;
  },

  async getCoachChangeRequests(
    token: string,
    status = "pending"
  ): Promise<CoachChangeRequestsResponse> {
    return httpClient.get<CoachChangeRequestsResponse>(
      ENDPOINTS.coach.changeRequests(status),
      token
    );
  },

  async rejectChangeRequest(requestId: string, token: string): Promise<void> {
    await httpClient.patch<void, Record<string, never>>(
      ENDPOINTS.coach.rejectChangeRequest(requestId),
      {},
      token
    );
  },

  async resolveChangeRequest(
    requestId: string,
    planId: string,
    token: string
  ): Promise<void> {
    await httpClient.patch<void, { planId: string }>(
      ENDPOINTS.coach.resolveChangeRequest(requestId),
      { planId },
      token
    );
  },
};
