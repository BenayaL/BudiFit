import { useState } from "react";
import type { FormEvent } from "react";
import type { LoginFormValues, LoginPageProps } from "./Login.types";
import { isLoginFormValid, validateLoginForm } from "./Login.validation";
import { userService } from "../userService";
import { useAuth } from "../../../app/AuthContext";
import { env } from "../../../config/env";

export function useLogin(onLoginSuccess: LoginPageProps["onLoginSuccess"]) {
  const auth = useAuth();
  const [form, setForm] = useState<LoginFormValues>({ username: "", password: "", rememberMe: false });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(field: keyof LoginFormValues, value: string | boolean) {
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

    if (env.IS_DEV) console.log("[LOGIN] Login started");

    try {
      const response = await userService.login({ username: form.username.trim(), password: form.password });
      if (env.IS_DEV)
        console.log("[LOGIN] Login succeeded — role:", response.role, "onboarded:", response.hasCompletedOnboarding);
      await auth.login(response, form.rememberMe);
      onLoginSuccess(response.role, response.hasCompletedOnboarding ?? false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      if (env.IS_DEV) console.error("[LOGIN] Login failed:", message);
      setError(message);
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
