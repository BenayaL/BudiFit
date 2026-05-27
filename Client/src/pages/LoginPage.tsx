import { useState } from "react";
import type { FormEvent } from "react";
import AppButton from "../components/ui/AppButton";
import FormField from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import BudiLogo from "../components/Logo/BudiLogo";
import BudiCharacter from "../components/Logo/BudiCharacter";

/**
 * Props that LoginPage receives from App.tsx.
 *
 * onLoginSuccess - runs after login succeeds.
 * onGoToRegister - moves the user to the register page.
 * onBackToWelcome - moves the user back to the welcome page.
 */
interface LoginPageProps {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
  onBackToWelcome: () => void;
}

/**
 * The shape of the login form state.
 *
 * This tells TypeScript that our form has exactly two fields:
 * email and password.
 */
type LoginFormValues = {
  email: string;
  password: string;
};

/**
 * LoginPage component
 *
 * This page allows an existing user to log in.
 * For now, the login is simulated on the client side.
 * Later, this is where we will call the backend login API.
 */
function LoginPage({
  onLoginSuccess,
  onGoToRegister,
  onBackToWelcome,
}: LoginPageProps) {
  /**
   * form stores the current values of the email and password inputs.
   *
   * This is called a controlled form because React controls the values
   * of the inputs through state.
   */
  const [form, setForm] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  /**
   * error stores a message if the user tries to submit invalid data.
   */
  const [error, setError] = useState("");

  /**
   * isLoading represents a fake loading state.
   *
   * Later, this will be true while waiting for the backend response.
   */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Checks whether the form has enough data to allow submit.
   *
   * trim() removes empty spaces, so "   " will not count as valid input.
   */
  const isFormValid = form.email.trim() !== "" && form.password.trim() !== "";

  /**
   * Updates one field inside the form state.
   *
   * field can only be "email" or "password" because we use keyof LoginFormValues.
   * value is the new value from the input.
   */
  function handleInputChange(field: keyof LoginFormValues, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    // Clear previous error when the user starts typing again.
    setError("");
  }

  /**
   * Handles form submit.
   *
   * event.preventDefault() prevents the browser from refreshing the page.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFormValid) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    /**
     * Temporary fake login.
     *
     * Later we will replace this with something like:
     * await authService.login(form.email, form.password)
     */
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 800);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfaf7] text-slate-950">
      {/* Soft purple background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(192,132,252,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(167,139,250,0.12),transparent_35%)]" />

      {/* Dotted background pattern */}
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(124,58,237,0.25)_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Main content layer above the background */}
      <section className="relative z-10 flex min-h-screen flex-col px-8 py-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          {/* Clicking the logo returns to the welcome page */}
          <button type="button" onClick={onBackToWelcome}>
            <BudiLogo />
          </button>

          <AppButton variant="ghost" onClick={onBackToWelcome}>
            Back home →
          </AppButton>
        </header>

        {/* Page center */}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
            {/* Left side - hidden on small screens */}
            <div className="hidden flex-col items-center text-center lg:flex">
              <BudiCharacter size="md" />

              <h1 className="mt-8 text-4xl font-extrabold tracking-tight">
                Welcome back.
              </h1>

              <p className="mt-4 max-w-md text-lg font-medium text-slate-600">
                Your coach saved your progress. Log in and continue your next
                challenge.
              </p>
            </div>

            {/* Login card */}
            <div className="rounded-[2rem] bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 backdrop-blur sm:p-10">
              <div className="mb-8 text-center">
                {/* On mobile we show Budi above the form */}
                <div className="mx-auto mb-4 flex justify-center lg:hidden">
                  <BudiCharacter size="sm" />
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight">
                  Log in
                </h2>

                <p className="mt-2 text-slate-500">
                  Continue your BudiFit journey.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email field */}
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

                {/* Password field */}
                <FormField id="password" label="Password">
                  <PasswordInput
                    value={form.password}
                    onChange={(value) => handleInputChange("password", value)}
                    autoComplete="current-password"
                  />
                </FormField>

                {/* General form error */}
                {error && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </p>
                )}

                {/* Submit button */}
                <div className="flex justify-center pt-2">
                  <AppButton
                    type="submit"
                    variant="primary"
                    disabled={!isFormValid || isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                  </AppButton>
                </div>
              </form>

              {/* Forgot password button*/}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => alert("Forgot password flow coming soon!")}
                  className="text-sm font-medium text-purple-600 transition hover:text-purple-700"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Link to register page */}
              <div className="mt-8 text-center text-sm text-slate-500">
                New here?{" "}
                <button
                  type="button"
                  onClick={onGoToRegister}
                  className="font-bold text-purple-600 transition hover:text-purple-700"
                >
                  Create an account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;