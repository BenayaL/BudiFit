import { useCallback, useState } from "react";
import { useAuth } from "../../../app/AuthContext";
import { userService } from "../userService";

import { useTraineeOnboarding } from "./useTraineeOnboarding";
import { OnboardingHeader } from "./components/OnboardingHeader";
import { OnboardingFooter } from "./components/OnboardingFooter";
import { WelcomeStep } from "./steps/WelcomeStep";
import { PersonalDetailsStep } from "./steps/PersonalDetailsStep";
import { BodyStatsStep } from "./steps/BodyStatsStep";
import { FitnessLevelStep } from "./steps/FitnessLevelStep";
import { GoalsStep } from "./steps/GoalsStep";
import { EquipmentStep } from "./steps/EquipmentStep";
import { HealthStep } from "./steps/HealthStep";
import { ScheduleStep } from "./steps/ScheduleStep";

import type { Equipment, FitnessLevel, MedicalCondition, PreferredWorkoutTime, SessionDurationMinutes } from "../user.models";
import type { Gender } from "../user.models";
import type { Goal } from "../user.models";

interface TraineeOnboardingPageProps {
  onComplete: () => void;
}

function TraineeOnboardingPage({ onComplete }: TraineeOnboardingPageProps) {
  const { token, updateCurrentUser } = useAuth();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onboarding = useTraineeOnboarding();

  const handleSubmit = useCallback(async () => {
    if (!token) {
      setServerError("You are not authenticated. Please log in again.");
      return;
    }

    const request = await onboarding.submit();
    if (!request) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      const result = await userService.submitOnboarding(request, token);
      updateCurrentUser(result.user);
      onComplete();
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Failed to save your profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [token, onboarding, updateCurrentUser, onComplete]);

  const {
    stepIndex,
    currentStep,
    totalSteps,
    formData,
    validationError,
    canGoNext,
    canGoBack,
    goNext,
    goBack,
    setAge,
    setGender,
    setHeight,
    setWeight,
    setFitnessLevel,
    toggleGoal,
    toggleEquipment,
    toggleMedicalCondition,
    setMedicalNotes,
    setWeeklyWorkouts,
    setPreferredWorkoutTime,
    setSessionDuration,
  } = onboarding;

  const isLastStep = stepIndex === totalSteps - 1;
  const isBodyStep = currentStep === "body";

  function renderStep() {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep />;

      case "personal":
        return (
          <PersonalDetailsStep
            age={formData.age}
            gender={formData.gender as Gender | ""}
            onAgeChange={setAge}
            onGenderChange={setGender}
            validationError={validationError}
          />
        );

      case "body":
        return (
          <BodyStatsStep
            height={formData.height}
            weight={formData.weight}
            onHeightChange={setHeight}
            onWeightChange={setWeight}
            validationError={validationError}
          />
        );

      case "fitness":
        return (
          <FitnessLevelStep
            fitnessLevel={formData.fitnessLevel as FitnessLevel | ""}
            onSelect={setFitnessLevel}
            validationError={validationError}
          />
        );

      case "goals":
        return (
          <GoalsStep
            goals={formData.goals as Goal[]}
            onToggle={toggleGoal}
            validationError={validationError}
          />
        );

      case "equipment":
        return (
          <EquipmentStep
            availableEquipment={formData.availableEquipment as Equipment[]}
            onToggle={toggleEquipment}
            validationError={validationError}
          />
        );

      case "health":
        return (
          <HealthStep
            medicalConditions={formData.medicalConditions as MedicalCondition[]}
            medicalNotes={formData.medicalNotes}
            onToggleCondition={toggleMedicalCondition}
            onNotesChange={setMedicalNotes}
            validationError={validationError}
          />
        );

      case "schedule":
        return (
          <ScheduleStep
            weeklyWorkouts={formData.weeklyWorkouts}
            preferredWorkoutTime={formData.preferredWorkoutTime as PreferredWorkoutTime | ""}
            sessionDurationMinutes={formData.sessionDurationMinutes as SessionDurationMinutes}
            onWeeklyWorkoutsChange={setWeeklyWorkouts}
            onPreferredTimeChange={setPreferredWorkoutTime}
            onSessionDurationChange={setSessionDuration}
            validationError={validationError}
          />
        );
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#fbfaf7] text-slate-950 dark:bg-[#141218] dark:text-[#F8F7FB]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(192,132,252,0.10),transparent_30%)]" />

      <OnboardingHeader stepIndex={stepIndex} totalSteps={totalSteps} />

      <main className="relative z-10 flex flex-1 overflow-y-auto px-6 py-8 sm:px-10">
        <div className="mx-auto w-full max-w-3xl">
          {renderStep()}

          {serverError && (
            <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400" role="alert">
              {serverError}
            </div>
          )}
        </div>
      </main>

      <OnboardingFooter
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        isLastStep={isLastStep}
        isSubmitting={isSubmitting}
        onBack={goBack}
        onNext={goNext}
        onSubmit={handleSubmit}
        isBodyStep={isBodyStep}
      />
    </div>
  );
}

export default TraineeOnboardingPage;
