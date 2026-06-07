import { useState, useEffect } from "react";
import type { Workout } from "../workout.models";
import type { WorkoutListState } from "./WorkoutList.types";
import { workoutService } from "../workoutService";
import { useAuth } from "../../../app/AuthContext";

export function useWorkoutList(): WorkoutListState {
  const { token } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        // TODO: Connect to GET /api/workouts when the server endpoint is implemented.
        const data = await workoutService.getWorkouts(token);
        setWorkouts(data);
      } catch (err) {
        console.error("[WORKOUT] Failed to load workouts:", err);
        setError("Failed to load workouts.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { workouts, isLoading, error };
}
