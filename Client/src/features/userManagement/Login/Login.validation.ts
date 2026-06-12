import type { LoginFormValues } from "./Login.types";

export function validateLoginForm(form: LoginFormValues): string {
  if (!form.username.trim() || !form.password.trim()) {
    return "Please enter both username and password.";
  }
  return "";
}

export function isLoginFormValid(form: LoginFormValues): boolean {
  return form.username.trim() !== "" && form.password.trim() !== "";
}
