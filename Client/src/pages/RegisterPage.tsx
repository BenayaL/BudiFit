import { useState } from "react";
import type { FormEvent } from "react";
import AppButton from "../components/ui/AppButton";
import FormField from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import BudiLogo from "../components/Logo/BudiLogo";
import BudiCharacter from "../components/Logo/BudiCharacter";

/**
 * Props that RegisterPage receives from App.tsx.
 *
 * onRegisterSuccess - runs after registration succeeds.
 * onGoToLogin - moves the user to the login page.
 * onBackToWelcome - moves the user back to the welcome page.
 */
interface RegisterPageProps {
    onRegisterSuccess: () => void;
    onGoToLogin: () => void;
    onBackToWelcome: () => void;
}

/**
 * The shape of the register form state.
 *
 * This tells TypeScript exactly which fields exist in the register form.
 */
type RegisterFormValues = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

/**
 * RegisterPage component
 *
 * This page allows a new user to create a BudiFit account.
 * For now, registration is simulated on the client side.
 * Later, this is where we will call the backend register API.
 */
function RegisterPage({
    onRegisterSuccess,
    onGoToLogin,
    onBackToWelcome,
}: RegisterPageProps) {
    /**
     * form stores all input values in one state object.
     *
     * This is called a controlled form because React controls the values
     * of the inputs through state.
     */
    const [form, setForm] = useState<RegisterFormValues>({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    /**
     * error stores a general validation message.
     *
     * Example:
     * - passwords do not match
     * - email is invalid
     * - required fields are missing
     */
    const [error, setError] = useState("");

    /**
     * isLoading represents a fake registration request.
     *
     * Later, this will be true while waiting for the backend response.
     */
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Checks whether all required fields contain text.
     *
     * trim() removes empty spaces, so "   " will not count as valid input.
     */
    const areRequiredFieldsFilled =
        form.fullName.trim() !== "" &&
        form.username.trim() !== "" &&
        form.email.trim() !== "" &&
        form.password.trim() !== "" &&
        form.confirmPassword.trim() !== "";

    /**
     * Checks whether the email looks valid enough for the UI stage.
     *
     * This is simple client-side validation.
     * Later, the backend should also validate the email.
     */
    const isEmailValid = form.email.includes("@") && form.email.includes(".");

    /**
     * Checks whether the password is long enough.
     *
     * This is a basic rule for now.
     * Later, we can add stronger rules if needed.
     */
    const isPasswordLongEnough = form.password.length >= 6;

    /**
     * Checks whether password and confirmPassword are the same.
     */
    const doPasswordsMatch = form.password === form.confirmPassword;

    /**
     * Final form validity.
     *
     * The register button will be disabled until this is true.
     */
    const isFormValid =
        areRequiredFieldsFilled &&
        isEmailValid &&
        isPasswordLongEnough &&
        doPasswordsMatch;

    /**
     * Updates one field inside the form state.
     *
     * field can only be one of the keys inside RegisterFormValues.
     * value is the new value from the input.
     */
    function handleInputChange(field: keyof RegisterFormValues, value: string) {
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

        /**
         * Defensive validation.
         *
         * Even though the button is disabled when the form is invalid,
         * we still validate here because users can submit forms in other ways.
         */
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

        /**
         * Temporary fake registration.
         *
         * Later we will replace this with something like:
         * await authService.register(form)
         */
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
                                {/* On mobile we show Budi above the form */}
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
                                {/* Full name field */}
                                <FormField id="fullName" label="Full name">
                                    <input
                                        id="fullName"
                                        type="text"
                                        placeholder="Your full name"
                                        value={form.fullName}
                                        onChange={(event) =>
                                            handleInputChange("fullName", event.target.value)
                                        }
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
                                    />
                                </FormField>

                                {/* Username field */}
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
                                        autoComplete="new-password"
                                        showStrength
                                    />
                                </FormField>

                                {/* Confirm password field */}
                                <FormField id="confirmPassword" label="Confirm password">
                                    <PasswordInput
                                        value={form.confirmPassword}
                                        onChange={(value) => handleInputChange("confirmPassword", value)}
                                        autoComplete="new-password"
                                    />
                                </FormField>

                                {/* Small password hint */}
                                <p className="text-xs font-medium text-slate-400">
                                    Password must be at least 6 characters.
                                </p>

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
                                        {isLoading ? "Creating account..." : "Create account"}
                                    </AppButton>
                                </div>
                            </form>

                            {/* Link to login page */}
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