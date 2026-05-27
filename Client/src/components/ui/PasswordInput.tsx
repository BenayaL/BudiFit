import { useState } from "react";

/**
 * PasswordInputProps defines the props that the PasswordInput component can receive.
 *
 * value - the current password value.
 * onChange - function that updates the password value in the parent component.
 * placeholder - optional text shown inside the input before typing.
 * autoComplete - tells the browser how to handle password autofill.
 * showStrength - controls whether to show the password strength meter.
 * lang - controls the text language of the show/hide button and strength label.
 */
interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  showStrength?: boolean;
}

/**
 * Calculates a simple password strength score.
 *
 * The score is between 0 and 4:
 * 0 - empty or very weak
 * 1 - at least 6 characters
 * 2 - at least 10 characters
 * 3 - includes uppercase letter
 * 4 - includes number or special character
 *
 * This is only client-side feedback for the user.
 * The backend should still validate passwords later.
 */
function strengthScore(password: string): number {
  if (!password) return 0;

  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^a-zA-Z]/.test(password)) score++;

  return score;
}

/**
 * PasswordInput component
 *
 * A reusable password field with:
 * - show/hide password button
 * - optional password strength meter
 * - support for English/Hebrew labels
 *
 * This component does not manage the password value itself.
 * The value is controlled by the parent component through props.
 */
function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  showStrength = false,
}: PasswordInputProps) {
  /**
   * show controls whether the password is visible or hidden.
   *
   * false → input type is "password"
   * true  → input type is "text"
   */
  const [show, setShow] = useState(false);

  /**
   * Calculate strength only if showStrength is true.
   * If not, strength is kept as 0 because we do not need it.
   */
  const strength = showStrength ? strengthScore(value) : 0;
  
  /**
   * Returns the text label that describes the password strength.
   */
  function getStrengthLabel(score: number): string {
    if (score === 0) return "At least 6 characters";
    if (score === 1) return "Weak — try adding numbers";
    if (score === 2) return "Okay — getting there";
    if (score === 3) return "Good password";
    return "Strong 🔥";
  }

  /**
   * Returns the Tailwind color class for each strength bar.
   *
   * index represents the bar number:
   * 0, 1, 2, 3
   */
  function getBarColor(index: number): string {
    if (index >= strength) {
      return "bg-slate-200";
    }

    if (strength <= 1) return "bg-red-500";
    if (strength <= 2) return "bg-amber-500";
    if (strength <= 3) return "bg-lime-500";

    return "bg-emerald-500";
  }

  return (
    <div>
      {/* Password input wrapper */}
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 pr-16 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
        />

        {/* Show / Hide password button */}
        <button
          type="button"
          onClick={() => setShow((currentValue) => !currentValue)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 transition hover:text-purple-600"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {/* Optional password strength meter */}
      {showStrength && (
        <div className="mt-2">
          {/* Strength bars */}
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${getBarColor(index)}`}
              />
            ))}
          </div>

          {/* Strength label */}
          <p className="mt-1.5 text-xs font-medium text-slate-500">
            {getStrengthLabel(strength)}
          </p>
        </div>
      )}
    </div>
  );
}

export default PasswordInput;