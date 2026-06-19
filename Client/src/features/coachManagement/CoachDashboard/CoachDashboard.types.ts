import type { Page } from "../../../app/app.types";
import type { Coach, Trainee, CoachPlan, CoachChangeRequestDTO } from "../coach.models";

export interface CoachDashboardPageProps {
  onChangePage: (page: Page) => void;
  onReviewPlan: (planId: string) => void;
  onViewTraineeProfile: (traineeId: string) => void;
}

export interface CoachDashboardState {
  coach: Coach | null;
  trainees: Trainee[];
  pendingPlans: CoachPlan[];
  pendingChangeRequests: CoachChangeRequestDTO[];
  isLoading: boolean;
  error: string;
}
