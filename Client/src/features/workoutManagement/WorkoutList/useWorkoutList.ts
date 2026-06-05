import { useState, useEffect } from "react";
import type { Workout } from "../workout.models";
import type { WorkoutListState } from "./WorkoutList.types";
import { workoutService } from "../workoutService";
import { useAuth } from "../../../app/AuthContext";

export function useWorkoutList(): WorkoutListState {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const error = "";

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await workoutService.getWorkouts(token);
        setWorkouts(data);
      } catch {
        // TODO: backend not connected yet — shows empty state
        console.warn("[DEV] getWorkouts failed — no fallback data.");
        setWorkouts([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { workouts, isLoading, error };
}
