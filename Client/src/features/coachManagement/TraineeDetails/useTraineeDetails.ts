import { useState, useEffect } from "react";
import type { Trainee, CoachPlan } from "../coach.models";
import type { TraineeDetailsState } from "./TraineeDetails.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";
import { COACH_FALLBACK_TRAINEES, COACH_FALLBACK_PLANS } from "../CoachDashboard/useCoachDashboard";

export function useTraineeDetails(traineeId: string | null): TraineeDetailsState {
  const { token } = useAuth();
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [plans, setPlans] = useState<CoachPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const error = "";

  useEffect(() => {
    if (!traineeId) {
      setIsLoading(false);
      return;
    }

    if (!token) {
      setTrainee(COACH_FALLBACK_TRAINEES.find((t) => t.userId === traineeId) ?? null);
      setPlans(COACH_FALLBACK_PLANS.filter((p) => p.traineeId === traineeId));
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
      } catch {
        // TODO: remove fallback when backend is connected
        console.warn("[DEV] getTraineeById failed — using fallback.");
        setTrainee(COACH_FALLBACK_TRAINEES.find((t) => t.userId === traineeId) ?? null);
        setPlans(COACH_FALLBACK_PLANS.filter((p) => p.traineeId === traineeId));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [traineeId, token]);

  return { trainee, plans, isLoading, error };
}
