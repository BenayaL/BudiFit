import { useState } from "react";
import type { FormEvent } from "react";
import type { RegisterFormValues, RegisterPageProps } from "./Register.types";
import { validateRegisterForm, isRegisterFormValid } from "./Register.validation";
import { userService } from "../userService";
import { env } from "../../../config/env";

const INITIAL_FORM: RegisterFormValues = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "trainee",
};

export function useRegister(onGoToLogin: RegisterPageProps["onGoToLogin"]) {
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

    if (env.IS_DEV) console.log("[REGISTER] Registration started");

    try {
      await userService.register({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      if (env.IS_DEV) console.log("[REGISTER] Registration succeeded");
      onGoToLogin();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      if (env.IS_DEV) console.error("[REGISTER] Registration failed:", message);
      setError(message);
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
