import { useState, useEffect, useCallback } from "react";
import type { CoachChangeRequestDTO } from "../coach.models";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";
import { notifyNotificationsChanged } from "../../notificationManagement/notificationRefreshBus";

export interface UseCoachChangeRequestsResult {
  requests: CoachChangeRequestDTO[];
  pendingCount: number;
  isLoading: boolean;
  error: string | null;
  rejectRequest: (requestId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCoachChangeRequests(): UseCoachChangeRequestsResult {
  const { token } = useAuth();
  const [requests, setRequests] = useState<CoachChangeRequestDTO[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await coachService.getCoachChangeRequests(token, "pending");
      setRequests(data.requests);
      setPendingCount(data.pendingCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load change requests.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const rejectRequest = useCallback(
    async (requestId: string): Promise<void> => {
      if (!token) throw new Error("Not authenticated.");
      await coachService.rejectChangeRequest(requestId, token);
      // Remove from local state immediately — no full reload needed
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setPendingCount((prev) => Math.max(0, prev - 1));
      notifyNotificationsChanged();
    },
    [token]
  );

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return { requests, pendingCount, isLoading, error, rejectRequest, refresh };
}
