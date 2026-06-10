import { useState, useEffect } from "react";
import type { UserSettings } from "../../userManagement/user.models";
import { userService } from "../../userManagement/userService";
import { useAuth } from "../../../app/AuthContext";

const DEFAULT_SETTINGS: UserSettings = {
  notifications: {
    dailyWorkoutReminder: true,
    coachMessages: true,
    challengeUpdates: true,
    reminderTime: "08:00",
  },
};

export function useNotificationSettings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }

    userService
      .getSettings(token)
      .then((data) => setSettings(data))
      .catch(() => setError("Failed to load settings."))
      .finally(() => setIsLoading(false));
  }, [token]);

  function toggleNotification(key: keyof UserSettings["notifications"]) {
    if (key === "reminderTime") return;
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
    setSuccess(false);
  }

  function setReminderTime(time: string) {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, reminderTime: time },
    }));
    setSuccess(false);
  }

  async function save() {
    if (!token) return;
    setIsSaving(true);
    setError("");
    setSuccess(false);
    try {
      const updated = await userService.updateSettings(settings, token);
      setSettings(updated);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save settings."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return { settings, isLoading, isSaving, error, success, toggleNotification, setReminderTime, save };
}
