import { useState, useEffect } from "react";
import type { CoachPlan } from "../coach.models";
import type { PlanReviewState, PlanListState } from "./PlanReview.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";

export function usePlanList(): PlanListState {
  const { token } = useAuth();
  const [plans, setPlans] = useState<CoachPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await coachService.getPlans(token);
        setPlans(data);
      } catch (err) {
        console.error("[COACH] Failed to load plans:", err);
        setError("Failed to load plans.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { plans, isLoading, error };
}

export function usePlanReview(planId: string | null): PlanReviewState {
  const { token } = useAuth();
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!planId || !token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await coachService.getPlanById(planId, token);
        setPlan(data);
      } catch (err) {
        console.error("[COACH] Failed to load plan:", err);
        setError("Failed to load plan.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [planId, token]);

  return { plan, isLoading, error };
}
