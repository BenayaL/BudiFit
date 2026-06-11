// All canonical values used by the trainee onboarding flow.
// These values will also be used by MongoDB validation,
// Zod validation, routes, and workout generation.

export const GENDERS = [
  "male",
  "female",
  "prefer_not_to_say",
] as const;

export type Gender = (typeof GENDERS)[number];

export const FITNESS_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type FitnessLevel =
  (typeof FITNESS_LEVELS)[number];

export const GOALS = [
  "strength",
  "cardio",
  "flex",
  "weightLoss",
  "consistency",
  "energy",
  "mood",
  "sleep",
] as const;

export type Goal = (typeof GOALS)[number];

export const EQUIPMENT_OPTIONS = [
  "barbell",
  "cables",
  "dumbbells",
  "machines",
  "kettlebell",
  "pullup",
  "smith",
  "bench",
  "rack",
  "cardioMachines",
  "trx",
  "bands",
] as const;

export type Equipment =
  (typeof EQUIPMENT_OPTIONS)[number];

/*
 * Health conditions or physical limitations that may affect
 * exercise selection.
 *
 * We keep the existing property name medicalConditions because
 * it is already used by the workout-generation service.
 */
export const MEDICAL_CONDITIONS = [
  "none",
  "knee",
  "back",
  "shoulder",
  "wrist_elbow",
  "hip_ankle",
  "cardiovascular_breathing",
  "mobility_balance",
  "other",
] as const;

export type MedicalCondition =
  (typeof MEDICAL_CONDITIONS)[number];

export const PREFERRED_WORKOUT_TIMES = [
  "morning",
  "afternoon",
  "evening",
] as const;

export type PreferredWorkoutTime =
  (typeof PREFERRED_WORKOUT_TIMES)[number];

export const SESSION_DURATION_OPTIONS = [
  30,
  45,
  60,
  90,
] as const;

export type SessionDurationMinutes =
  (typeof SESSION_DURATION_OPTIONS)[number];