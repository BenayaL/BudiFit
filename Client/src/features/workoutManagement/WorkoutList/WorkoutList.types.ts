import type { Workout } from "../workout.models";

export interface WorkoutListState {
  workouts: Workout[];
  isLoading: boolean;
  error: string;
}

export interface WorkoutCardProps {
  workout: Workout;
  onSelect: (workoutId: string) => void;
}
