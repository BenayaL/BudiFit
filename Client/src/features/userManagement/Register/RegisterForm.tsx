import type { FormEvent } from "react";
import AppButton from "../../../common/AppButton/AppButton";
import FormField from "../../../common/FormField/FormField";
import PasswordInput from "../../../common/PasswordInput/PasswordInput";
import type { RegisterFormValues } from "./Register.types";

interface RegisterFormProps {
  form: RegisterFormValues;
  error: string;
  isLoading: boolean;
  isFormValid: boolean;
  onInputChange: (field: keyof RegisterFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoToLogin: () => void;
}

export function RegisterForm({
  form,
  error,
  isLoading,
  isFormValid,
  onInputChange,
  onSubmit,
  onGoToLogin,
}: RegisterFormProps) {
  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15";

  return (
    <div className="rounded-[2rem] bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 backdrop-blur sm:p-10">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight">Create account</h2>
        <p className="mt-2 text-slate-500">Start your BudiFit journey today.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-bold text-slate-700">I want to join as</p>
          <div className="grid grid-cols-2 gap-3">
            {(["trainee", "coach"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onInputChange("role", role)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  form.role === role
                    ? "border-purple-500 bg-purple-50 text-purple-700 ring-4 ring-purple-500/10"
                    : "border-slate-200 bg-white text-slate-600 hover:border-purple-200"
                }`}
              >
                <span className="block text-sm font-extrabold capitalize">{role}</span>
                <span className="mt-1 block text-xs">
                  {role === "trainee" ? "I want workouts and challenges" : "I manage trainees and plans"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <FormField id="firstName" label="First name">
          <input id="firstName" type="text" placeholder="Your first name" value={form.firstName} onChange={(e) => onInputChange("firstName", e.target.value)} className={inputClass} />
        </FormField>

        <FormField id="lastName" label="Last name">
          <input id="lastName" type="text" placeholder="Your last name" value={form.lastName} onChange={(e) => onInputChange("lastName", e.target.value)} className={inputClass} />
        </FormField>

        <FormField id="username" label="Username">
          <input id="username" type="text" placeholder="Choose a username" value={form.username} onChange={(e) => onInputChange("username", e.target.value)} className={inputClass} />
        </FormField>

        <FormField id="email" label="Email">
          <input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => onInputChange("email", e.target.value)} className={inputClass} />
        </FormField>

        <FormField id="password" label="Password">
          <PasswordInput value={form.password} onChange={(v) => onInputChange("password", v)} autoComplete="new-password" showStrength />
        </FormField>

        <FormField id="confirmPassword" label="Confirm password">
          <PasswordInput value={form.confirmPassword} onChange={(v) => onInputChange("confirmPassword", v)} autoComplete="new-password" />
        </FormField>

        <p className="text-xs font-medium text-slate-400">Password must be at least 6 characters.</p>

        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
        )}

        <div className="flex justify-center pt-2">
          <AppButton type="submit" variant="primary" disabled={!isFormValid || isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </AppButton>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button type="button" onClick={onGoToLogin} className="font-bold text-purple-600 transition hover:text-purple-700">
          Log in
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;
