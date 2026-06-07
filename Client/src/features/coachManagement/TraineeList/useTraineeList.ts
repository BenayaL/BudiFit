import { useState, useEffect } from "react";
import type { Trainee } from "../coach.models";
import type { TraineeListState } from "./TraineeList.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";

export function useTraineeList(): TraineeListState {
  const { token } = useAuth();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await coachService.getTrainees(token);
        setTrainees(data);
      } catch (err) {
        console.error("[COACH] Failed to load trainees:", err);
        setError("Failed to load trainees.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { trainees, isLoading, error };
}
