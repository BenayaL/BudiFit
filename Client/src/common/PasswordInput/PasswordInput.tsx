import { useState } from "react";
import type { PasswordInputProps } from "./PasswordInput.types";

function strengthScore(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^a-zA-Z]/.test(password)) score++;
  return score;
}

function getStrengthLabel(score: number): string {
  if (score === 0) return "At least 6 characters";
  if (score === 1) return "Weak — try adding numbers";
  if (score === 2) return "Okay — getting there";
  if (score === 3) return "Good password";
  return "Strong 🔥";
}

function getBarColor(index: number, strength: number): string {
  if (index >= strength) return "bg-slate-200";
  if (strength <= 1) return "bg-red-500";
  if (strength <= 2) return "bg-amber-500";
  if (strength <= 3) return "bg-lime-500";
  return "bg-emerald-500";
}

function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  showStrength = false,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const strength = showStrength ? strengthScore(value) : 0;

  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 pr-16 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
        />

        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 transition hover:text-purple-600"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {showStrength && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${getBarColor(index, strength)}`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs font-medium text-slate-500">
            {getStrengthLabel(strength)}
          </p>
        </div>
      )}
    </div>
  );
}

export default PasswordInput;
