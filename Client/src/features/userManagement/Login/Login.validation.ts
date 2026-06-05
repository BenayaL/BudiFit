import type { LoginFormValues } from "./Login.types";

export function validateLoginForm(form: LoginFormValues): string {
  if (!form.email.trim() || !form.password.trim()) {
    return "Please enter both email and password.";
  }
  return "";
}

export function isLoginFormValid(form: LoginFormValues): boolean {
  return form.email.trim() !== "" && form.password.trim() !== "";
}
