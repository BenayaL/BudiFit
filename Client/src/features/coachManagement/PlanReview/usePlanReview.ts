import { useState, useEffect, useCallback } from "react";
import type { CoachPlan, CoachPlanUpdateBody } from "../coach.models";
// CoachPlanUpdateBody is exported from coach.models
import type { PlanReviewState, PlanListState } from "./PlanReview.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";
import { notifyNotificationsChanged } from "../../notificationManagement/notificationRefreshBus";

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

interface UsePlanReviewResult extends PlanReviewState {
  isSaving: boolean;
  saveChanges: (updates: CoachPlanUpdateBody) => Promise<CoachPlan | null>;
  approvePlan: () => Promise<boolean>;
  deletePlan: () => Promise<boolean>;
}

export function usePlanReview(planId: string | null): UsePlanReviewResult {
  const { token } = useAuth();
  const [plan, setPlan] = useState<CoachPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!planId || !token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

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

  const saveChanges = useCallback(
    async (updates: CoachPlanUpdateBody): Promise<CoachPlan | null> => {
      if (!planId || !token) return null;
      setIsSaving(true);
      setError("");
      try {
        const updated = await coachService.updatePlan(planId, updates, token);
        setPlan(updated);
        notifyNotificationsChanged();
        return updated;
      } catch (err) {
        console.error("[COACH] Failed to save plan:", err);
        setError(err instanceof Error ? err.message : "Failed to save changes");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [planId, token]
  );

  const approvePlan = useCallback(async (): Promise<boolean> => {
    if (!planId || !token) return false;
    setIsSaving(true);
    setError("");
    try {
      const updated = await coachService.approvePlan(planId, token);
      setPlan(updated);
      notifyNotificationsChanged();
      return true;
    } catch (err) {
      console.error("[COACH] Failed to approve plan:", err);
      setError(err instanceof Error ? err.message : "Failed to approve plan");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [planId, token]);

  const deletePlan = useCallback(async (): Promise<boolean> => {
    if (!planId || !token) return false;
    setIsSaving(true);
    setError("");
    try {
      await coachService.deletePlan(planId, token);
      notifyNotificationsChanged();
      return true;
    } catch (err) {
      console.error("[COACH] Failed to delete plan:", err);
      setError(err instanceof Error ? err.message : "Failed to delete plan");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [planId, token]);

  return { plan, isLoading, error, isSaving, saveChanges, approvePlan, deletePlan };
}
