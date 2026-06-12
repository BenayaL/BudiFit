import { useState, useEffect } from "react";
import type { Trainee, CoachPlan } from "../coach.models";
import type { TraineeDetailsState } from "./TraineeDetails.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";

export function useTraineeDetails(traineeId: string | null): TraineeDetailsState {
  const { token } = useAuth();
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [plans, setPlans] = useState<CoachPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!traineeId || !token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await coachService.getTraineeById(traineeId, token);
        setTrainee(data.trainee);
        setPlans(data.plans);
      } catch (err) {
        console.error("[COACH] Failed to load trainee details:", err);
        setError("Failed to load trainee details.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [traineeId, token]);

  return { trainee, plans, isLoading, error };
}
