import { useState, useEffect } from "react";
import type { CoachPlan } from "../coach.models";
import type { PlanReviewState, PlanListState } from "./PlanReview.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";
import { COACH_FALLBACK_PLANS } from "../CoachDashboard/useCoachDashboard";

export function usePlanList(): PlanListState {
  const { token } = useAuth();
  const [plans, setPlans] = useState<CoachPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const error = "";

  useEffect(() => {
    if (!token) {
      setPlans(COACH_FALLBACK_PLANS);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await coachService.getPlans(token);
        setPlans(data);
      } catch {
        // TODO: remove fallback when backend is connected
        console.warn("[DEV] getPlans failed — using fallback.");
        setPlans(COACH_FALLBACK_PLANS);
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
  const error = "";

  useEffect(() => {
    if (!planId) {
      setIsLoading(false);
      return;
    }

    if (!token) {
      setPlan(COACH_FALLBACK_PLANS.find((p) => p.id === planId) ?? null);
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await coachService.getPlanById(planId, token);
        setPlan(data);
      } catch {
        // TODO: remove fallback when backend is connected
        console.warn("[DEV] getPlanById failed — using fallback.");
        setPlan(COACH_FALLBACK_PLANS.find((p) => p.id === planId) ?? null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [planId, token]);

  return { plan, isLoading, error };
}
