import { BudiLogo } from "../../../../common/BudiLogo/BudiLogo";

interface OnboardingHeaderProps {
  stepIndex: number;
  totalSteps: number;
}

export function OnboardingHeader({ stepIndex, totalSteps }: OnboardingHeaderProps) {
  const displayStep = stepIndex + 1;

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
      <BudiLogo />

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1.5 sm:flex" role="progressbar" aria-valuenow={displayStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={`Step ${displayStep} of ${totalSteps}`}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={[
                "h-1.5 w-6 rounded-full transition-all duration-300",
                i < stepIndex
                  ? "bg-purple-400 opacity-60"
                  : i === stepIndex
                  ? "bg-purple-600"
                  : "bg-slate-200",
              ].join(" ")}
            />
          ))}
        </div>

        <span className="text-sm font-semibold tabular-nums text-slate-500">
          {String(displayStep).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
        </span>
      </div>
    </header>
  );
}
