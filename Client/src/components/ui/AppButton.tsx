import type { ReactNode } from "react";

/**
 * AppButtonProps defines which props our reusable button can receive.
 *
 * children - the text/content inside the button.
 * onClick - the function that runs when the user clicks the button.
 * variant - controls the visual style of the button.
 * type - controls the HTML button type.
 * disabled - disables the button and prevents user clicks.
 */
export interface AppButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

/**
 * AppButton component
 *
 * A reusable button component for the whole app.
 * Instead of repeating Tailwind classes in every page,
 * we define the button styles once here.
 */
export function AppButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
}: AppButtonProps) {
  /**
   * Base classes are shared by all button variants.
   * These control the general shape, spacing, font, animations,
   * and disabled button behavior.
   */
  const baseClasses =
    "rounded-2xl px-9 py-4 font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

  /**
   * Variant classes change the button appearance.
   * primary - main purple action button.
   * secondary - white button for secondary action.
   * ghost - transparent button, useful for header links.
   */
  const variantClasses = {
    primary:
      "bg-purple-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)] hover:bg-purple-700 disabled:hover:bg-purple-600",
    secondary:
      "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:hover:bg-white",
    ghost:
      "bg-transparent px-0 py-0 text-slate-950 hover:text-purple-700 disabled:hover:text-slate-950",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default AppButton;