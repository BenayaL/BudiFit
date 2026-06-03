// features/auth = domain module for authentication (login, register, logout)
// This page allows a new user to create a BudiFit account.
// Later, handleSubmit will call authService.register() instead of the fake timeout.

import { useState } from "react";
import type { FormEvent } from "react";

// shared = reusable components used by several features
import AppButton from "../../../common/ui/AppButton";
import FormField from "../../../common/ui/FormField";
import PasswordInput from "../../../common/ui/PasswordInput";
import BudiLogo from "../../../common/logo/BudiLogo";
import BudiCharacter from "../../../common/logo/BudiCharacter";

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onGoToLogin: () => void;
  onBackToWelcome: () => void;
}

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function RegisterPage({
  onRegisterSuccess,
  onGoToLogin,
  onBackToWelcome,
}: RegisterPageProps) {
  const [form, setForm] = useState<RegisterFormValues>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const areRequiredFieldsFilled =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.username.trim() !== "" &&
    form.email.trim() !== "" &&
    form.password.trim() !== "" &&
    form.confirmPassword.trim() !== "";

  const isEmailValid = form.email.includes("@") && form.email.includes(".");
  const isPasswordLongEnough = form.password.length >= 6;
  const doPasswordsMatch = form.password === form.confirmPassword;

  const isFormValid =
    areRequiredFieldsFilled &&
    isEmailValid &&
    isPasswordLongEnough &&
    doPasswordsMatch;

  function handleInputChange(field: keyof RegisterFormValues, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!areRequiredFieldsFilled) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isPasswordLongEnough) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!doPasswordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    // Temporary fake registration — replace with: await authService.register(form)
    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess();
    }, 900);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfaf7] text-slate-950">
      {/* Soft purple background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(192,132,252,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(167,139,250,0.12),transparent_35%)]" />

      {/* Dotted background pattern */}
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(124,58,237,0.25)_1px,transparent_1px)] [background-size:32px_32px]" />

      <section className="relative z-10 flex min-h-screen flex-col px-8 py-8">
        <header className="flex items-center justify-between">
          <button type="button" onClick={onBackToWelcome}>
            <BudiLogo />
          </button>

          <AppButton variant="ghost" onClick={onBackToWelcome}>
            Back home →
          </AppButton>
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
            {/* Left side — hidden on small screens */}
            <div className="hidden flex-col items-center text-center lg:flex">
              <BudiCharacter size="md" />

              <h1 className="mt-8 text-4xl font-extrabold tracking-tight">
                Meet your new AI coach.
              </h1>

              <p className="mt-4 max-w-md text-lg font-medium text-slate-600">
                Create your account, set your goals, and let Budi build your
                daily fitness challenges.
              </p>
            </div>

            {/* Register card */}
            <div className="rounded-[2rem] bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 backdrop-blur sm:p-10">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex justify-center lg:hidden">
                  <BudiCharacter size="sm" />
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight">
                  Create account
                </h2>

                <p className="mt-2 text-slate-500">
                  Start your BudiFit journey today.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField id="firstName" label="First name">
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Your first name"
                    value={form.firstName}
                    onChange={(event) =>
                      handleInputChange("firstName", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
                  />
                </FormField>

                <FormField id="lastName" label="Last name">
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Your last name"
                    value={form.lastName}
                    onChange={(event) =>
                      handleInputChange("lastName", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
                  />
                </FormField>

                <FormField id="username" label="Username">
                  <input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={(event) =>
                      handleInputChange("username", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
                  />
                </FormField>

                <FormField id="email" label="Email">
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(event) =>
                      handleInputChange("email", event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
                  />
                </FormField>

                <FormField id="password" label="Password">
                  <PasswordInput
                    value={form.password}
                    onChange={(value) => handleInputChange("password", value)}
                    autoComplete="new-password"
                    showStrength
                  />
                </FormField>

                <FormField id="confirmPassword" label="Confirm password">
                  <PasswordInput
                    value={form.confirmPassword}
                    onChange={(value) =>
                      handleInputChange("confirmPassword", value)
                    }
                    autoComplete="new-password"
                  />
                </FormField>

                <p className="text-xs font-medium text-slate-400">
                  Password must be at least 6 characters.
                </p>

                {error && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </p>
                )}

                <div className="flex justify-center pt-2">
                  <AppButton
                    type="submit"
                    variant="primary"
                    disabled={!isFormValid || isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create account"}
                  </AppButton>
                </div>
              </form>

              <div className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="font-bold text-purple-600 transition hover:text-purple-700"
                >
                  Log in
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
