import { useState } from "react";
import type { FormEvent } from "react";
import type { EditProfileFormValues, EditProfileFormProps } from "./EditProfile.types";
import { userService } from "../userService";
import { useAuth } from "../../../app/AuthContext";

export function useEditProfile(
  initialValues: EditProfileFormValues,
  onSaved: EditProfileFormProps["onSaved"]
) {
  const { token, updateDisplayInfo } = useAuth();
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

    setIsLoading(true);
    setError("");

    try {
      if (token) {
        await userService.updateUserProfile(
          { firstName: form.firstName, lastName: form.lastName, goals: form.goals },
          token
        );
      }
      updateDisplayInfo(form.firstName, 0);
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
