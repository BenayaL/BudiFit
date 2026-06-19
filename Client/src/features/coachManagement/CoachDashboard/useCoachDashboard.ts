import { useState, useEffect } from "react";
import type { Coach, Trainee, CoachPlan, CoachChangeRequestDTO } from "../coach.models";
import type { CoachDashboardState } from "./CoachDashboard.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";

export function useCoachDashboard(): CoachDashboardState {
  const { token } = useAuth();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [pendingPlans, setPendingPlans] = useState<CoachPlan[]>([]);
  const [pendingChangeRequests, setPendingChangeRequests] = useState<CoachChangeRequestDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const [dashData, changeData] = await Promise.all([
          coachService.getCoachDashboard(token),
          coachService.getCoachChangeRequests(token, "pending"),
        ]);
        setCoach(dashData.coach);
        setTrainees(dashData.trainees);
        setPendingPlans(dashData.pendingPlans);
        setPendingChangeRequests(changeData.requests);
      } catch (err) {
        console.error("[COACH] Failed to load dashboard:", err);
        setError("Failed to load coach dashboard.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { coach, trainees, pendingPlans, pendingChangeRequests, isLoading, error };
}
