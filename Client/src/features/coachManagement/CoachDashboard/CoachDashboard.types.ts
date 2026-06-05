import type { Page } from "../../../app/app.types";
import type { Coach, Trainee, CoachPlan } from "../coach.models";

export interface CoachDashboardPageProps {
  onChangePage: (page: Page) => void;
  onReviewPlan: (planId: string) => void;
  onViewTraineeProfile: (traineeId: string) => void;
}

export interface CoachDashboardState {
  coach: Coach | null;
  trainees: Trainee[];
  pendingPlans: CoachPlan[];
  isLoading: boolean;
  error: string;
}
