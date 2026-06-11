interface OnboardingFooterProps {
  stepIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isBodyStep?: boolean;
}

export function OnboardingFooter({
  stepIndex,
  canGoBack,
  canGoNext,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  isBodyStep = false,
}: OnboardingFooterProps) {
  return (
    <footer className="flex items-center justify-between border-t border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-0"
        aria-label="Go to previous step"
      >
        ← Back
      </button>

      <div className="flex items-center gap-3">
        {isBodyStep && (
          <button
            type="button"
            onClick={onNext}
            className="text-sm font-semibold text-slate-400 transition hover:text-slate-600"
          >
            Skip
          </button>
        )}

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canGoNext || isSubmitting}
            className="rounded-2xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)] transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 disabled:active:scale-100"
            aria-label={isSubmitting ? "Saving your profile…" : "Finish onboarding"}
          >
            {isSubmitting ? "Saving…" : "Start training →"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stepIndex === 0 ? onNext : onNext}
            disabled={!canGoNext}
            className="rounded-2xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(124,58,237,0.35)] transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95 disabled:active:scale-100"
            aria-label="Go to next step"
          >
            {stepIndex === 0 ? "Get started →" : "Next →"}
          </button>
        )}
      </div>
    </footer>
  );
}
