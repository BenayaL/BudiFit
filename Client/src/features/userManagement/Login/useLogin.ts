import { useState } from "react";
import type { FormEvent } from "react";
import type { LoginFormValues, LoginPageProps } from "./Login.types";
import { isLoginFormValid, validateLoginForm } from "./Login.validation";
import { userService } from "../userService";
import { useAuth } from "../../../app/AuthContext";

export function useLogin(onLoginSuccess: LoginPageProps["onLoginSuccess"]) {
  const auth = useAuth();
  const [form, setForm] = useState<LoginFormValues>({email: "",password: "",rememberMe: false,});
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
      auth.login(response, form.rememberMe);
      onLoginSuccess(response.role);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
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
