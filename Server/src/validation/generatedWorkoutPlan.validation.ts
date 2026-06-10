import { z } from "zod";

/*
 * Allowed plan categories.
 */
export const generatedWorkoutPlanCategorySchema = z.enum([
  "strength",
  "hypertrophy",
  "endurance",
  "general_fitness",
  "mobility",
  "weight_loss",
]);

/*
 * One exercise returned by Gemini.
 *
 * strict() prevents Gemini from adding fields
 * that are not part of our expected structure.
 */
export const generatedWorkoutExerciseSchema = z
  .object({
    order: z.number().int().min(1).max(50),

    name: z.string().trim().min(1).max(120),

    sets: z.number().int().min(1).max(20).optional(),

    /*
     * Examples:
     * "8"
     * "8-10"
     * "AMRAP"
     * "30 seconds"
     */
    reps: z.string().trim().min(1).max(40).optional(),

    durationSec: z.number().int().min(0).max(7200).optional(),

    restSec: z.number().int().min(0).max(1800).optional(),

    equipment: z.string().trim().min(1).max(100),

    notes: z.string().trim().max(500).optional(),
  })
  .strict()
  .superRefine((exercise, ctx) => {
    /*
     * An exercise must include at least one useful execution value:
     * sets, reps, or duration.
     */
    if (
      exercise.sets === undefined &&
      exercise.reps === undefined &&
      exercise.durationSec === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Exercise must contain sets, reps, or durationSec",
      });
    }
  });

/*
 * One day inside the generated workout plan.
 */
export const generatedWorkoutDaySchema = z
  .object({
    dayNumber: z.number().int().min(1).max(7),

    title: z.string().trim().min(1).max(120),

    restDay: z.boolean(),

    durationMinutes: z.number().int().min(0).max(300),

    exercises: z.array(generatedWorkoutExerciseSchema).max(20),
  })
  .strict()
  .superRefine((day, ctx) => {
    /*
     * A rest day must not contain exercises.
     */
    if (day.restDay && day.exercises.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exercises"],
        message: "A rest day cannot contain exercises",
      });
    }

    /*
     * A workout day must contain at least one exercise.
     */
    if (!day.restDay && day.exercises.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exercises"],
        message:
          "A workout day must contain at least one exercise",
      });
    }

    /*
     * A rest day should have no workout duration.
     */
    if (day.restDay && day.durationMinutes !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationMinutes"],
        message:
          "A rest day must have durationMinutes equal to 0",
      });
    }

    /*
     * A real workout should have a positive duration.
     */
    if (!day.restDay && day.durationMinutes < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationMinutes"],
        message:
          "A workout day must have a positive duration",
      });
    }

    /*
     * Exercise order values must be unique inside one day.
     */
    const exerciseOrders = day.exercises.map(
      (exercise) => exercise.order
    );

    const uniqueExerciseOrders = new Set(exerciseOrders);

    if (uniqueExerciseOrders.size !== exerciseOrders.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exercises"],
        message:
          "Exercise order values must be unique inside a workout day",
      });
    }
  });

/*
 * The exact JSON object that Gemini is allowed to return.
 *
 * Do not include:
 * - userId
 * - status
 * - profileSnapshot
 * - createdAt
 * - updatedAt
 *
 * Those values are controlled by our server, not Gemini.
 */
export const generatedWorkoutPlanResponseSchema = z
  .object({
    title: z.string().trim().min(1).max(150),

    description: z.string().trim().min(1).max(1500),

    category: generatedWorkoutPlanCategorySchema,

    difficulty: z.number().int().min(1).max(5),

    durationWeeks: z.number().int().min(1).max(12),

    workoutDaysPerWeek: z.number().int().min(1).max(7),

    equipment: z
      .array(z.string().trim().min(1).max(100))
      .max(30),

    requiresProfessionalReview: z.boolean(),

    days: z.array(generatedWorkoutDaySchema).min(1).max(7),
  })
  .strict()
  .superRefine((plan, ctx) => {
    /*
     * The amount of non-rest days must match
     * workoutDaysPerWeek.
     */
    const actualWorkoutDays = plan.days.filter(
      (day) => !day.restDay
    ).length;

    if (actualWorkoutDays !== plan.workoutDaysPerWeek) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["days"],
        message:
          "The number of workout days must match workoutDaysPerWeek",
      });
    }

    /*
     * Reject duplicate day numbers.
     */
    const dayNumbers = plan.days.map(
      (day) => day.dayNumber
    );

    const uniqueDayNumbers = new Set(dayNumbers);

    if (uniqueDayNumbers.size !== dayNumbers.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["days"],
        message:
          "Workout plan contains duplicate day numbers",
      });
    }

    /*
     * Make sure the plan contains no more than seven calendar days.
     */
    if (plan.days.length > 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["days"],
        message:
          "Workout plan cannot contain more than seven days",
      });
    }
  });

/*
 * TypeScript types generated directly from the Zod schemas.
 */
export type GeneratedWorkoutExerciseInput = z.infer<
  typeof generatedWorkoutExerciseSchema
>;

export type GeneratedWorkoutDayInput = z.infer<
  typeof generatedWorkoutDaySchema
>;

export type GeneratedWorkoutPlanResponse = z.infer<
  typeof generatedWorkoutPlanResponseSchema
>;

/*
 * Additional business validation that depends on the trainee profile.
 *
 * Zod validates the structure returned by Gemini.
 * This function validates that the generated values match the actual
 * authenticated trainee profile.
 */
export function validateGeneratedPlanForTrainee(
  plan: GeneratedWorkoutPlanResponse,
  expectedWeeklyWorkouts: number
): GeneratedWorkoutPlanResponse {
  if (
    plan.workoutDaysPerWeek !== expectedWeeklyWorkouts
  ) {
    throw new Error(
      `Generated plan contains ${plan.workoutDaysPerWeek} workout days, but the trainee requested ${expectedWeeklyWorkouts}`
    );
  }

  const actualWorkoutDays = plan.days.filter(
    (day) => !day.restDay
  ).length;

  if (actualWorkoutDays !== expectedWeeklyWorkouts) {
    throw new Error(
      `Generated plan contains ${actualWorkoutDays} actual workout days, but the trainee requested ${expectedWeeklyWorkouts}`
    );
  }

  return plan;
}