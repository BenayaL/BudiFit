import type { Page } from "../../../app/app.types";
import type { CoachPlan } from "../coach.models";

export interface PlanListPageProps {
  onChangePage: (page: Page) => void;
  onReviewPlan: (planId: string) => void;
  onReviewPlanFromRequest: (planId: string, changeRequestId: string) => void;
}

export interface PlanReviewPageProps {
  selectedPlanId: string | null;
  changeRequestId: string | null;
  onChangePage: (page: Page) => void;
}

export interface PlanReviewState {
  plan: CoachPlan | null;
  isLoading: boolean;
  error: string;
}

export interface PlanListState {
  plans: CoachPlan[];
  isLoading: boolean;
  error: string;
}
