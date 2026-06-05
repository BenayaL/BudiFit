import { useState } from "react";
import type { FormEvent } from "react";
import type { LoginFormValues, LoginPageProps } from "./Login.types";
import { isLoginFormValid, validateLoginForm } from "./Login.validation";
import { userService } from "../userService";
import { useAuth } from "../../../app/AuthContext";

export function useLogin(onLoginSuccess: LoginPageProps["onLoginSuccess"]) {
  const auth = useAuth();
  const [form, setForm] = useState<LoginFormValues>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(field: keyof LoginFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateLoginForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await userService.login({ email: form.email, password: form.password });
      auth.login(response);
      onLoginSuccess(response.role);
    } catch {
      // DEV fallback — remove when backend is connected
      if (import.meta.env.DEV) {
        console.warn("[DEV] Backend not connected — using local login fallback.");
        const role = form.email.toLowerCase().includes("coach") ? "coach" : "trainee";
        auth.login({ token: "dev-token", userId: "dev-user-1", role });
        onLoginSuccess(role);
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
    isFormValid: isLoginFormValid(form),
    handleInputChange,
    handleSubmit,
  };
}
