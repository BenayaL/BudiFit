import { useState, useCallback } from "react";
import type {
  Equipment,
  FitnessLevel,
  Gender,
  Goal,
  MedicalCondition,
  OnboardingRequest,
  PreferredWorkoutTime,
  SessionDurationMinutes,
} from "../user.models";
import type { OnboardingFormData, OnboardingStep } from "./Onboarding.types";
import { ONBOARDING_STEPS, TOTAL_STEPS } from "./onboarding.constants";

const DEFAULT_FORM_DATA: OnboardingFormData = {
  age: "",
  gender: "",
  height: "",
  weight: "",
  fitnessLevel: "",
  goals: [],
  availableEquipment: [],
  medicalConditions: [],
  medicalNotes: "",
  weeklyWorkouts: 3,
  preferredWorkoutTime: "",
  sessionDurationMinutes: 60,
};

export type StepValidationError = string | null;

function validateStep(
  step: OnboardingStep,
  data: OnboardingFormData
): StepValidationError {
  switch (step) {
    case "welcome":
      return null;

    case "personal": {
      const ageNum = Number(data.age);
      if (!data.age || isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 10 || ageNum > 99) {
        return "Enter a valid age between 10 and 99.";
      }
      return null;
    }

    case "body":
      // Optional step — both fields may be empty
      if (data.height) {
        const h = Number(data.height);
        if (isNaN(h) || h < 100 || h > 250) return "Height must be between 100 and 250 cm.";
      }
      if (data.weight) {
        const w = Number(data.weight);
        if (isNaN(w) || w < 30 || w > 300) return "Weight must be between 30 and 300 kg.";
      }
      return null;

    case "fitness":
      return data.fitnessLevel ? null : "Please select your fitness level.";

    case "goals":
      return data.goals.length >= 1 ? null : "Please select at least one goal.";

    case "equipment":
      return data.availableEquipment.length >= 1 ? null : "Please select at least one equipment option.";

    case "health": {
      const notes = data.medicalNotes.trim();
      if (notes.length > 500) return "Medical notes must be at most 500 characters.";
      return null;
    }

    case "schedule":
      if (!data.preferredWorkoutTime) return "Please select a preferred workout time.";
      return null;

    default:
      return null;
  }
}

function buildRequest(data: OnboardingFormData): OnboardingRequest {
  const request: OnboardingRequest = {
    age: Number(data.age),
    fitnessLevel: data.fitnessLevel as FitnessLevel,
    goals: data.goals,
    availableEquipment: data.availableEquipment,
    weeklyWorkouts: data.weeklyWorkouts,
    preferredWorkoutTime: data.preferredWorkoutTime as PreferredWorkoutTime,
    sessionDurationMinutes: data.sessionDurationMinutes as SessionDurationMinutes,
  };

  if (data.gender) {
    request.gender = data.gender as Gender;
  }

  const heightNum = Number(data.height);
  if (data.height && !isNaN(heightNum) && heightNum >= 100 && heightNum <= 250) {
    request.height = heightNum;
  }

  const weightNum = Number(data.weight);
  if (data.weight && !isNaN(weightNum) && weightNum >= 30 && weightNum <= 300) {
    request.weight = weightNum;
  }

  if (data.medicalConditions.length > 0) {
    request.medicalConditions = data.medicalConditions;
  }

  const trimmedNotes = data.medicalNotes.trim();
  if (trimmedNotes.length > 0) {
    request.medicalNotes = trimmedNotes;
  }

  return request;
}

export interface UseTraineeOnboardingResult {
  stepIndex: number;
  currentStep: OnboardingStep;
  totalSteps: number;
  formData: OnboardingFormData;
  validationError: StepValidationError;
  isSubmitting: boolean;
  serverError: string;

  canGoNext: boolean;
  canGoBack: boolean;

  goNext: () => void;
  goBack: () => void;

  setAge: (value: string) => void;
  setGender: (value: Gender | "") => void;
  setHeight: (value: string) => void;
  setWeight: (value: string) => void;
  setFitnessLevel: (value: FitnessLevel) => void;
  toggleGoal: (goal: Goal) => void;
  toggleEquipment: (equipment: Equipment) => void;
  toggleMedicalCondition: (condition: MedicalCondition) => void;
  setMedicalNotes: (value: string) => void;
  setWeeklyWorkouts: (value: number) => void;
  setPreferredWorkoutTime: (value: PreferredWorkoutTime) => void;
  setSessionDuration: (value: SessionDurationMinutes) => void;

  submit: () => Promise<OnboardingRequest | null>;
}

export function useTraineeOnboarding(): UseTraineeOnboardingResult {
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(DEFAULT_FORM_DATA);
  const [validationError, setValidationError] = useState<StepValidationError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const currentStep = ONBOARDING_STEPS[stepIndex];

  const goNext = useCallback(() => {
    const error = validateStep(currentStep, formData);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    if (stepIndex < TOTAL_STEPS - 1) {
      setStepIndex((i) => i + 1);
    }
  }, [currentStep, formData, stepIndex]);

  const goBack = useCallback(() => {
    setValidationError(null);
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    }
  }, [stepIndex]);

  const setAge = useCallback((value: string) => {
    setFormData((d) => ({ ...d, age: value }));
    setValidationError(null);
  }, []);

  const setGender = useCallback((value: Gender | "") => {
    setFormData((d) => ({ ...d, gender: value }));
  }, []);

  const setHeight = useCallback((value: string) => {
    setFormData((d) => ({ ...d, height: value }));
    setValidationError(null);
  }, []);

  const setWeight = useCallback((value: string) => {
    setFormData((d) => ({ ...d, weight: value }));
    setValidationError(null);
  }, []);

  const setFitnessLevel = useCallback((value: FitnessLevel) => {
    setFormData((d) => ({ ...d, fitnessLevel: value }));
    setValidationError(null);
  }, []);

  const toggleGoal = useCallback((goal: Goal) => {
    setFormData((d) => {
      if (d.goals.includes(goal)) {
        return { ...d, goals: d.goals.filter((g) => g !== goal) };
      }
      if (d.goals.length >= 3) return d;
      return { ...d, goals: [...d.goals, goal] };
    });
    setValidationError(null);
  }, []);

  const toggleEquipment = useCallback((equipment: Equipment) => {
    setFormData((d) => {
      if (d.availableEquipment.includes(equipment)) {
        return { ...d, availableEquipment: d.availableEquipment.filter((e) => e !== equipment) };
      }
      return { ...d, availableEquipment: [...d.availableEquipment, equipment] };
    });
    setValidationError(null);
  }, []);

  const toggleMedicalCondition = useCallback((condition: MedicalCondition) => {
    setFormData((d) => {
      if (condition === "none") {
        // Selecting "none" clears all other conditions
        return { ...d, medicalConditions: d.medicalConditions.includes("none") ? [] : ["none"] };
      }
      // Selecting any other condition removes "none"
      const withoutNone = d.medicalConditions.filter((c) => c !== "none");
      if (withoutNone.includes(condition)) {
        return { ...d, medicalConditions: withoutNone.filter((c) => c !== condition) };
      }
      return { ...d, medicalConditions: [...withoutNone, condition] };
    });
    setValidationError(null);
  }, []);

  const setMedicalNotes = useCallback((value: string) => {
    setFormData((d) => ({ ...d, medicalNotes: value }));
    setValidationError(null);
  }, []);

  const setWeeklyWorkouts = useCallback((value: number) => {
    setFormData((d) => ({ ...d, weeklyWorkouts: value }));
  }, []);

  const setPreferredWorkoutTime = useCallback((value: PreferredWorkoutTime) => {
    setFormData((d) => ({ ...d, preferredWorkoutTime: value }));
    setValidationError(null);
  }, []);

  const setSessionDuration = useCallback((value: SessionDurationMinutes) => {
    setFormData((d) => ({ ...d, sessionDurationMinutes: value }));
  }, []);

  const submit = useCallback(async (): Promise<OnboardingRequest | null> => {
    const error = validateStep(currentStep, formData);
    if (error) {
      setValidationError(error);
      return null;
    }

    setIsSubmitting(true);
    setServerError("");
    setValidationError(null);

    try {
      return buildRequest(formData);
    } catch {
      setServerError("Failed to prepare onboarding data. Please try again.");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentStep, formData]);

  const canGoNext = validateStep(currentStep, formData) === null;
  const canGoBack = stepIndex > 0;

  return {
    stepIndex,
    currentStep,
    totalSteps: TOTAL_STEPS,
    formData,
    validationError,
    isSubmitting,
    serverError,
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
    submit,
  };
}
