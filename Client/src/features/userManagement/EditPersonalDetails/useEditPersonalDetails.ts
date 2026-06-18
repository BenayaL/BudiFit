import { useState, useEffect, useCallback } from "react";

import { useAuth } from "../../../app/AuthContext";
import { userService } from "../userService";

import type {
  FitnessLevel,
  Gender,
  Goal,
  Equipment,
  MedicalCondition,
  PreferredWorkoutTime,
  SessionDurationMinutes,
  OnboardingRequest,
  TraineeProfileData,
} from "../user.models";

export interface EditPersonalDetailsForm {
  age: string;
  gender: Gender | "";
  height: string;
  weight: string;
  fitnessLevel: FitnessLevel | "";
  goals: Goal[];
  availableEquipment: Equipment[];
  medicalConditions: MedicalCondition[];
  medicalNotes: string;
  weeklyWorkouts: number;
  preferredWorkoutTime: PreferredWorkoutTime | "";
  sessionDurationMinutes: SessionDurationMinutes;
}

const DEFAULT_FORM: EditPersonalDetailsForm = {
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
  sessionDurationMinutes: 30,
};

function profileToForm(profile: TraineeProfileData): EditPersonalDetailsForm {
  return {
    age: String(profile.age),
    gender: profile.gender ?? "",
    height: profile.height !== undefined ? String(profile.height) : "",
    weight: profile.weight !== undefined ? String(profile.weight) : "",
    fitnessLevel: profile.fitnessLevel,
    goals: [...profile.goals],
    availableEquipment: [...profile.availableEquipment],
    medicalConditions: [...profile.medicalConditions],
    medicalNotes: profile.medicalNotes ?? "",
    weeklyWorkouts: profile.weeklyWorkouts,
    preferredWorkoutTime: profile.preferredWorkoutTime,
    sessionDurationMinutes: profile.sessionDurationMinutes,
  };
}

export function useEditPersonalDetails(onSaved?: () => void) {
  const { token, updateCurrentUser } = useAuth();
  const [form, setForm] = useState<EditPersonalDetailsForm>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    setIsLoading(true);
    setLoadError(null);

    userService
      .getTraineeProfile(token)
      .then((response) => {
        if (!cancelled) setForm(profileToForm(response.profile));
      })
      .catch(() => {
        if (!cancelled)
          setLoadError("Failed to load your profile. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggleGoal = useCallback((goal: Goal) => {
    setForm((prev) => {
      if (prev.goals.includes(goal)) {
        return { ...prev, goals: prev.goals.filter((g) => g !== goal) };
      }
      if (prev.goals.length >= 3) return prev;
      return { ...prev, goals: [...prev.goals, goal] };
    });
  }, []);

  const toggleEquipment = useCallback((eq: Equipment) => {
    setForm((prev) => {
      if (prev.availableEquipment.includes(eq)) {
        return {
          ...prev,
          availableEquipment: prev.availableEquipment.filter((e) => e !== eq),
        };
      }
      return { ...prev, availableEquipment: [...prev.availableEquipment, eq] };
    });
  }, []);

  const toggleMedicalCondition = useCallback((condition: MedicalCondition) => {
    setForm((prev) => {
      if (condition === "none") {
        const alreadyNone = prev.medicalConditions.includes("none");
        return {
          ...prev,
          medicalConditions: alreadyNone ? [] : ["none"],
        };
      }
      const withoutNone = prev.medicalConditions.filter((c) => c !== "none");
      if (withoutNone.includes(condition)) {
        return {
          ...prev,
          medicalConditions: withoutNone.filter((c) => c !== condition),
        };
      }
      return { ...prev, medicalConditions: [...withoutNone, condition] };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!token) return;

    setSaveError(null);
    setSuccess(false);

    const parsedAge = parseInt(form.age, 10);
    if (!form.age || isNaN(parsedAge) || parsedAge < 10 || parsedAge > 99) {
      setSaveError("Age must be between 10 and 99.");
      return;
    }
    if (!form.fitnessLevel) {
      setSaveError("Please select a fitness level.");
      return;
    }
    if (form.goals.length < 1 || form.goals.length > 3) {
      setSaveError("Please select 1 to 3 goals.");
      return;
    }
    if (form.availableEquipment.length < 1) {
      setSaveError("Please select at least one equipment option.");
      return;
    }
    if (!form.preferredWorkoutTime) {
      setSaveError("Please select a preferred workout time.");
      return;
    }

    const parsedHeight = form.height ? parseFloat(form.height) : undefined;
    const parsedWeight = form.weight ? parseFloat(form.weight) : undefined;

    if (parsedHeight !== undefined && (isNaN(parsedHeight) || parsedHeight < 100 || parsedHeight > 250)) {
      setSaveError("Height must be between 100 and 250 cm.");
      return;
    }
    if (parsedWeight !== undefined && (isNaN(parsedWeight) || parsedWeight < 30 || parsedWeight > 300)) {
      setSaveError("Weight must be between 30 and 300 kg.");
      return;
    }

    const body: OnboardingRequest = {
      age: parsedAge,
      gender: form.gender || undefined,
      height: parsedHeight,
      weight: parsedWeight,
      fitnessLevel: form.fitnessLevel,
      goals: form.goals,
      availableEquipment: form.availableEquipment,
      medicalConditions:
        form.medicalConditions.length > 0 ? form.medicalConditions : undefined,
      medicalNotes: form.medicalNotes.trim() || undefined,
      weeklyWorkouts: form.weeklyWorkouts,
      preferredWorkoutTime: form.preferredWorkoutTime,
      sessionDurationMinutes: form.sessionDurationMinutes,
    };

    setIsSaving(true);
    try {
      const response = await userService.updateTraineeProfile(body, token);
      updateCurrentUser(response.user);
      setSuccess(true);
      setTimeout(() => {
        onSaved?.();
      }, 900);
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to save your profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }, [form, token, updateCurrentUser, onSaved]);

  return {
    form,
    setForm,
    isLoading,
    isSaving,
    loadError,
    saveError,
    success,
    toggleGoal,
    toggleEquipment,
    toggleMedicalCondition,
    handleSubmit,
  };
}
