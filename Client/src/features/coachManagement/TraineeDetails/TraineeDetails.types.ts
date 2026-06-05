import type { Page } from "../../../app/app.types";
import type { Trainee, CoachPlan } from "../coach.models";

export interface TraineeDetailsPageProps {
  selectedTraineeId: string | null;
  onChangePage: (page: Page) => void;
  onReviewPlan: (planId: string) => void;
}

export interface TraineeDetailsState {
  trainee: Trainee | null;
  plans: CoachPlan[];
  isLoading: boolean;
  error: string;
}
