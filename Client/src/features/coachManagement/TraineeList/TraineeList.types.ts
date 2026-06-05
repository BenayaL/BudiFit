import type { Trainee } from "../coach.models";

export interface TraineeListPageProps {
  onViewTraineeProfile: (traineeId: string) => void;
}

export interface TraineeListState {
  trainees: Trainee[];
  isLoading: boolean;
  error: string;
}
