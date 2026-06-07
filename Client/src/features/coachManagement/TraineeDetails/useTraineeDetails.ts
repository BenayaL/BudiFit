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
        const [t, allPlans] = await Promise.all([
          coachService.getTraineeById(traineeId, token),
          coachService.getPlans(token),
        ]);
        setTrainee(t);
        setPlans(allPlans.filter((p) => p.traineeId === traineeId));
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
