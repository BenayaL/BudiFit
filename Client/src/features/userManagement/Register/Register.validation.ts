import type { RegisterFormValues } from "./Register.types";

export function validateRegisterForm(form: RegisterFormValues): string {
  const required = ["firstName", "lastName", "username", "email", "password", "confirmPassword"] as const;
  const allFilled = required.every((key) => form[key].trim() !== "");

  if (!allFilled) return "Please fill in all required fields.";
  if (!form.email.includes("@") || !form.email.includes(".")) return "Please enter a valid email address.";
  if (form.password.length < 6) return "Password must be at least 6 characters long.";
  if (form.password !== form.confirmPassword) return "Passwords do not match.";

  return "";
}

export function isRegisterFormValid(form: RegisterFormValues): boolean {
  return validateRegisterForm(form) === "";
}
