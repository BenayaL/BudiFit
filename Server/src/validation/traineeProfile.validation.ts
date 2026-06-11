import { z } from "zod";

import {
  EQUIPMENT_OPTIONS,
  FITNESS_LEVELS,
  GENDERS,
  GOALS,
  MEDICAL_CONDITIONS,
  PREFERRED_WORKOUT_TIMES,
} from "../models/TraineeProfile.types";

/**
 * Checks that an array contains no duplicate values.
 */
const hasUniqueValues = <T>(values: T[]): boolean => {
  return new Set(values).size === values.length;
};

/**
 * Validates all information submitted by the trainee
 * when completing the onboarding flow.
 *
 * The user ID is intentionally not included here.
 * It must be received only from the verified JWT.
 */
export const traineeOnboardingSchema = z
  .object({
    age: z
      .number()
      .int("Age must be an integer")
      .min(10, "Age must be at least 10")
      .max(99, "Age must be at most 99"),

    gender: z.enum(GENDERS).optional(),

    height: z
      .number()
      .min(100, "Height must be at least 100 cm")
      .max(250, "Height must be at most 250 cm")
      .optional(),

    weight: z
      .number()
      .min(30, "Weight must be at least 30 kg")
      .max(300, "Weight must be at most 300 kg")
      .optional(),

    fitnessLevel: z.enum(FITNESS_LEVELS),

    goals: z
      .array(z.enum(GOALS))
      .min(1, "Select at least one goal")
      .max(3, "Select no more than three goals")
      .refine(hasUniqueValues, {
        message: "Goals must not contain duplicate values",
      }),

    availableEquipment: z
      .array(z.enum(EQUIPMENT_OPTIONS))
      .min(1, "Select at least one equipment option")
      .refine(hasUniqueValues, {
        message: "Equipment must not contain duplicate values",
      }),

    /*
     * Optional because the trainee may skip the health step.
     *
     * [] means the step was skipped.
     * ["none"] means the trainee explicitly selected
     * that there are no known exercise-related limitations.
     */
    medicalConditions: z
      .array(z.enum(MEDICAL_CONDITIONS))
      .refine(hasUniqueValues, {
        message:
          "Medical conditions must not contain duplicate values",
      })
      .optional(),

    /*
     * The Client must omit this property when the input is empty.
     * Empty strings are rejected instead of being stored.
     */
    medicalNotes: z
      .string()
      .trim()
      .min(1, "Medical notes cannot be empty")
      .max(
        500,
        "Medical notes must contain at most 500 characters"
      )
      .optional(),

    weeklyWorkouts: z
      .number()
      .int("Weekly workouts must be an integer")
      .min(1, "Weekly workouts must be at least 1")
      .max(6, "Weekly workouts must be at most 6"),

    preferredWorkoutTime: z.enum(
      PREFERRED_WORKOUT_TIMES
    ),

    sessionDurationMinutes: z.union([
      z.literal(30),
      z.literal(45),
      z.literal(60),
      z.literal(90),
    ]),
  })
  .strict()
  .superRefine((data, context) => {
    const medicalConditions =
      data.medicalConditions ?? [];

    /*
     * "none" represents an explicit declaration that the
     * trainee has no known exercise-related limitation.
     * It cannot appear together with another limitation.
     */
    if (
      medicalConditions.includes("none") &&
      medicalConditions.length > 1
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["medicalConditions"],
        message:
          '"none" cannot be selected together with another medical condition',
      });
    }
  });

/**
 * The request type is generated from the validation schema.
 * This keeps the route type synchronized with the real rules.
 */
export type TraineeOnboardingInput = z.infer<
  typeof traineeOnboardingSchema
>;