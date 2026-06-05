import { useState } from "react";
import type { FormEvent } from "react";
import type { RegisterFormValues, RegisterPageProps } from "./Register.types";
import { validateRegisterForm, isRegisterFormValid } from "./Register.validation";
import { userService } from "../userService";
import { useAuth } from "../../../app/AuthContext";

const INITIAL_FORM: RegisterFormValues = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "trainee",
};

export function useRegister(onRegisterSuccess: RegisterPageProps["onRegisterSuccess"]) {
  const auth = useAuth();
  const [form, setForm] = useState<RegisterFormValues>(INITIAL_FORM);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(field: keyof RegisterFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateRegisterForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await userService.register({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      auth.login(response);
      auth.updateDisplayInfo(form.firstName, 0);
      onRegisterSuccess(response.role);
    } catch {
      // DEV fallback — remove when backend is connected
      if (import.meta.env.DEV) {
        console.warn("[DEV] Backend not connected — using local register fallback.");
        auth.login({ token: "dev-token", userId: "dev-user-1", role: form.role });
        auth.updateDisplayInfo(form.firstName, 0);
        onRegisterSuccess(form.role);
        return;
      }
      setError("Cannot connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    error,
    isLoading,
    isFormValid: isRegisterFormValid(form),
    handleInputChange,
    handleSubmit,
  };
}
