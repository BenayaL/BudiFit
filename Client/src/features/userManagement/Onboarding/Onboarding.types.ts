import type {
  Equipment,
  FitnessLevel,
  Gender,
  Goal,
  MedicalCondition,
  PreferredWorkoutTime,
  SessionDurationMinutes,
} from "../user.models";

export interface OnboardingFormData {
  // Step 2 — personal details
  age: string;
  gender: Gender | "";

  // Step 3 — body stats
  height: string;
  weight: string;

  // Step 4 — fitness level
  fitnessLevel: FitnessLevel | "";

  // Step 5 — goals
  goals: Goal[];

  // Step 6 — equipment
  availableEquipment: Equipment[];

  // Step 7 — health
  medicalConditions: MedicalCondition[];
  medicalNotes: string;

  // Step 8 — schedule
  weeklyWorkouts: number;
  preferredWorkoutTime: PreferredWorkoutTime | "";
  sessionDurationMinutes: SessionDurationMinutes;
}

export type OnboardingStep =
  | "welcome"
  | "personal"
  | "body"
  | "fitness"
  | "goals"
  | "equipment"
  | "health"
  | "schedule";
