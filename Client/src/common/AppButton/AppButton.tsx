import type { AppButtonProps } from "./AppButton.types";

export function AppButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
}: AppButtonProps) {
  const baseClasses =
    "rounded-2xl px-9 py-4 font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

  const variantClasses = {
    primary:
      "bg-purple-600 text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)] hover:bg-purple-700 disabled:hover:bg-purple-600",
    secondary:
      "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:hover:bg-white dark:bg-[#2A2436] dark:text-[#F8F7FB] dark:ring-slate-600 dark:hover:bg-[#3B344A] dark:disabled:hover:bg-slate-700",
    ghost:
      "bg-transparent px-0 py-0 text-slate-950 hover:text-purple-700 disabled:hover:text-slate-950 dark:text-[#F8F7FB] dark:hover:text-purple-400 dark:disabled:hover:text-slate-100",
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
