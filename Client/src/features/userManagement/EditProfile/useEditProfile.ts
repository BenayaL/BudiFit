import { useState } from "react";
import type { FormEvent } from "react";
import type { EditProfileFormValues, EditProfileFormProps } from "./EditProfile.types";
import { userService } from "../userService";
import { useAuth } from "../../../app/AuthContext";

export function useEditProfile(
  initialValues: EditProfileFormValues,
  onSaved: EditProfileFormProps["onSaved"]
) {
  const { token, updateCurrentUser } = useAuth();
  const [form, setForm] = useState<EditProfileFormValues>(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleInputChange(field: "firstName" | "lastName", value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  }

  function toggleGoal(goal: EditProfileFormValues["goals"][number]) {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    if (!token) {
      setError("Not authenticated.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const updated = await userService.updateCurrentUser(
        {
          firstName: form.firstName,
          lastName: form.lastName,
          goals: form.goals,
        },
        token
      );
      // Sync the new data into AuthContext so TopNav and other consumers update immediately
      updateCurrentUser(updated);
      setSuccess(true);
      onSaved(form);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return { form, isLoading, error, success, handleInputChange, toggleGoal, handleSubmit };
}
