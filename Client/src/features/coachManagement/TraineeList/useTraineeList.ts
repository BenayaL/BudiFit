import { useState, useEffect } from "react";
import type { Trainee } from "../coach.models";
import type { TraineeListState } from "./TraineeList.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";
import { COACH_FALLBACK_TRAINEES } from "../CoachDashboard/useCoachDashboard";

export function useTraineeList(): TraineeListState {
  const { token } = useAuth();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const error = "";

  useEffect(() => {
    if (!token) {
      setTrainees(COACH_FALLBACK_TRAINEES);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await coachService.getTrainees(token);
        setTrainees(data);
      } catch {
        // TODO: remove fallback when backend is connected
        console.warn("[DEV] getTrainees failed — using fallback.");
        setTrainees(COACH_FALLBACK_TRAINEES);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { trainees, isLoading, error };
}
