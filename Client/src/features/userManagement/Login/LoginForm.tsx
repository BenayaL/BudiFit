import type { FormEvent } from "react";
import AppButton from "../../../common/AppButton/AppButton";
import FormField from "../../../common/FormField/FormField";
import PasswordInput from "../../../common/PasswordInput/PasswordInput";
import type { LoginFormValues } from "./Login.types";

interface LoginFormProps {
  form: LoginFormValues;
  error: string;
  isLoading: boolean;
  isFormValid: boolean;
  onInputChange: (field: keyof LoginFormValues,value: string | boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onForgotPassword: () => void;
  onGoToRegister: () => void;
}

export function LoginForm({
  form,
  error,
  isLoading,
  isFormValid,
  onInputChange,
  onSubmit,
  onForgotPassword,
  onGoToRegister,
}: LoginFormProps) {
  return (
    <div className="rounded-[2rem] bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 backdrop-blur sm:p-10 dark:bg-[#211D2B]/90 dark:ring-[#3B344A]">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight dark:text-[#F8F7FB]">Log in</h2>
        <p className="mt-2 text-slate-500 dark:text-[#9E97AF]">Continue your BudiFit journey.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <FormField id="username" label="Username">
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={form.username}
            onChange={(e) => onInputChange("username", e.target.value)}
            autoComplete="username"
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15 dark:border-[#3B344A] dark:bg-[#2A2436]/60 dark:text-[#F8F7FB] dark:placeholder:text-[#9E97AF]"
          />
        </FormField>

        <FormField id="password" label="Password">
          <PasswordInput
            value={form.password}
            onChange={(value) => onInputChange("password", value)}
            autoComplete="current-password"
          />
        </FormField>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 dark:text-[#9E97AF]">
          <input
            type="checkbox"
            checked={form.rememberMe}
            onChange={(event) =>
              onInputChange("rememberMe", event.target.checked)
            }
            className="h-4 w-4 rounded border-slate-300 accent-purple-600"
          />
          <span>Keep me signed in</span>
        </label>

        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
        )}

        <div className="flex justify-center pt-2">
          <AppButton type="submit" variant="primary" disabled={!isFormValid || isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </AppButton>
        </div>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-medium text-purple-600 transition hover:text-purple-700"
        >
          Forgot your password?
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-slate-500 dark:text-[#9E97AF]">
        New here?{" "}
        <button
          type="button"
          onClick={onGoToRegister}
          className="font-bold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          Create an account
        </button>
      </div>
    </div>
  );
}

export default LoginForm;
