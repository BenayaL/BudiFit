import { useState, useEffect } from "react";
import type { CoachConnectionResponse } from "../../userManagement/user.models";
import { userService } from "../../userManagement/userService";
import { useAuth } from "../../../app/AuthContext";

export function useCoachConnection() {
  const { token } = useAuth();
  const [connection, setConnection] = useState<CoachConnectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coachCodeInput, setCoachCodeInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }

    userService
      .getCoachConnection(token)
      .then((data) => setConnection(data))
      .catch(() => setError("Failed to load coach connection."))
      .finally(() => setIsLoading(false));
  }, [token]);

  async function connect() {
    if (!token || !coachCodeInput.trim()) return;
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const result = await userService.connectToCoach(coachCodeInput.trim(), token);
      setConnection(result);
      setCoachCodeInput("");
      setSuccess("Connected to coach successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function disconnect() {
    if (!token) return;
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await userService.disconnectFromCoach(token);
      setConnection((prev) => (prev ? { ...prev, coach: null } : null));
      setSuccess("Disconnected from coach.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyCode() {
    const code = connection?.coachCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setSuccess("Code copied to clipboard.");
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  return {
    connection,
    isLoading,
    isSubmitting,
    coachCodeInput,
    setCoachCodeInput,
    error,
    success,
    connect,
    disconnect,
    copyCode,
  };
}
