import type {
  Equipment,
  FitnessLevel,
  Gender,
  Goal,
  MedicalCondition,
  PreferredWorkoutTime,
  SessionDurationMinutes,
} from "../user.models";
import type { OnboardingStep } from "./Onboarding.types";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "personal",
  "body",
  "fitness",
  "goals",
  "equipment",
  "health",
  "schedule",
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

export const FITNESS_LEVEL_OPTIONS: {
  value: FitnessLevel;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to working out or returning after a long break.",
    emoji: "🌱",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Training consistently for 6+ months.",
    emoji: "💪",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Years of structured training and solid technique.",
    emoji: "🔥",
  },
];

export const GOAL_OPTIONS: {
  value: Goal;
  label: string;
  emoji: string;
}[] = [
  { value: "strength", label: "Build Strength", emoji: "🏋️" },
  { value: "cardio", label: "Cardio Fitness", emoji: "❤️" },
  { value: "flex", label: "Flexibility", emoji: "🧘" },
  { value: "weightLoss", label: "Weight Loss", emoji: "⚖️" },
  { value: "consistency", label: "Stay Consistent", emoji: "✅" },
  { value: "energy", label: "More Energy", emoji: "⚡" },
  { value: "mood", label: "Better Mood", emoji: "😊" },
  { value: "sleep", label: "Better Sleep", emoji: "😴" },
];

export const EQUIPMENT_OPTIONS: {
  value: Equipment;
  label: string;
  emoji: string;
}[] = [
  { value: "barbell", label: "Barbell", emoji: "🏋️" },
  { value: "cables", label: "Cables", emoji: "〰️" },
  { value: "dumbbells", label: "Dumbbells", emoji: "💪" },
  { value: "machines", label: "Machines", emoji: "⚙️" },
  { value: "kettlebell", label: "Kettlebell", emoji: "🏐" },
  { value: "pullup", label: "Pull-up Bar", emoji: "⬆" },
  { value: "smith", label: "Smith Machine", emoji: "🔧" },
  { value: "bench", label: "Bench", emoji: "🪑" },
  { value: "rack", label: "Power Rack", emoji: "🏗️" },
  { value: "cardioMachines", label: "Cardio Machines", emoji: "🚴" },
  { value: "trx", label: "TRX / Suspension", emoji: "🧲" },
  { value: "bands", label: "Resistance Bands", emoji: "〰" },
];

export const MEDICAL_CONDITION_OPTIONS: {
  value: MedicalCondition;
  label: string;
}[] = [
  { value: "none", label: "No known limitations" },
  { value: "knee", label: "Knee limitation" },
  { value: "back", label: "Back limitation" },
  { value: "shoulder", label: "Shoulder limitation" },
  { value: "wrist_elbow", label: "Wrist or elbow limitation" },
  { value: "hip_ankle", label: "Hip or ankle limitation" },
  { value: "cardiovascular_breathing", label: "Breathing or cardiovascular limitation" },
  { value: "mobility_balance", label: "Mobility or balance limitation" },
  { value: "other", label: "Other" },
];

export const GENDER_OPTIONS: {
  value: Gender;
  label: string;
}[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const PREFERRED_TIME_OPTIONS: {
  value: PreferredWorkoutTime;
  label: string;
  timeRange: string;
  emoji: string;
}[] = [
  { value: "morning", label: "Morning", timeRange: "05:00–10:00", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon", timeRange: "10:00–16:00", emoji: "☀️" },
  { value: "evening", label: "Evening", timeRange: "16:00–22:00", emoji: "🌙" },
];

export const SESSION_DURATION_OPTIONS: {
  value: SessionDurationMinutes;
  label: string;
}[] = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
  { value: 90, label: "90+ min" },
];

export const WEEKLY_WORKOUT_OPTIONS = [1, 2, 3, 4, 5, 6] as const;
