import express, { Response } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import User from "../models/user.model";
import TraineeProfile from "../models/TraineeProfile.model";

import GeneratedWorkoutPlan, {
    IGeneratedWorkoutDay,
    IGeneratedWorkoutExercise,
    IGeneratedWorkoutPlan,
} from "../models/generatedWorkoutPlan.model";

import {
    AuthenticatedRequest,
    authenticateToken,
} from "../middleware/auth.middleware";

import {
    generatePersonalizedWorkoutPlan,
    WorkoutGenerationError,
    WorkoutGenerationTraineeContext,
} from "../services/generatedWorkoutPlan.service";

const generatedWorkoutPlanRouter = express.Router();

/*
 * Gemini requests are more expensive than ordinary API requests.
 */
const workoutGenerationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,

    message: {
        success: false,
        message:
            "Too many workout generation requests. Please try again later.",
    },

    standardHeaders: true,
    legacyHeaders: false,
});

/*
 * Convert a Mongoose document into a clean DTO for the client.
 */
function formatGeneratedWorkoutPlan(
    plan: IGeneratedWorkoutPlan
) {
    return {
        id: String(plan._id),
        userId: String(plan.userId),

        title: plan.title,
        description: plan.description,
        category: plan.category,
        difficulty: plan.difficulty,
        durationWeeks: plan.durationWeeks,
        workoutDaysPerWeek: plan.workoutDaysPerWeek,
        equipment: plan.equipment,
        status: plan.status,

        requiresProfessionalReview:
            plan.requiresProfessionalReview,

        profileSnapshot: {
            fitnessLevel:
                plan.profileSnapshot.fitnessLevel,

            goals:
                plan.profileSnapshot.goals,

            weeklyWorkouts:
                plan.profileSnapshot.weeklyWorkouts,

            height:
                plan.profileSnapshot.height,

            weight:
                plan.profileSnapshot.weight,

            age:
                plan.profileSnapshot.age,

            gender:
                plan.profileSnapshot.gender,

            availableEquipment:
                plan.profileSnapshot.availableEquipment,

            medicalConditions:
                plan.profileSnapshot.medicalConditions,

            medicalNotes:
                plan.profileSnapshot.medicalNotes,

            preferredWorkoutTime:
                plan.profileSnapshot.preferredWorkoutTime,

            sessionDurationMinutes:
                plan.profileSnapshot.sessionDurationMinutes,
        },

        days: plan.days.map(
            (day: IGeneratedWorkoutDay) => ({
                id: day._id
                    ? String(day._id)
                    : undefined,

                dayNumber: day.dayNumber,
                title: day.title,
                restDay: day.restDay,
                durationMinutes: day.durationMinutes,

                exercises: day.exercises.map(
                    (
                        exercise: IGeneratedWorkoutExercise
                    ) => ({
                        id: exercise._id
                            ? String(exercise._id)
                            : undefined,

                        order: exercise.order,
                        name: exercise.name,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        durationSec: exercise.durationSec,
                        restSec: exercise.restSec,
                        equipment: exercise.equipment,
                        notes: exercise.notes,
                    })
                ),
            })
        ),

        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
    };
}

/*
 * Convert classified Gemini errors into HTTP responses.
 */
function sendWorkoutGenerationError(
    error: WorkoutGenerationError,
    res: Response
): void {
    switch (error.code) {
        case "AI_NOT_CONFIGURED":
            res.status(500).json({
                success: false,
                message: error.message,
            });
            return;

        case "AI_RATE_LIMITED":
            res.status(429).json({
                success: false,
                message: error.message,
            });
            return;

        case "AI_UNAVAILABLE":
            res.status(503).json({
                success: false,
                message: error.message,
            });
            return;

        case "EMPTY_AI_RESPONSE":
        case "INVALID_AI_JSON":
        case "INVALID_AI_STRUCTURE":
        case "INVALID_AI_PLAN":
            res.status(502).json({
                success: false,
                message:
                    "The AI returned an invalid workout plan. Please try again.",
            });
            return;

        case "AI_GENERATION_FAILED":
        default:
            res.status(502).json({
                success: false,
                message:
                    "Failed to generate workout plan",
            });
    }
}

/*
 * POST /api/generated-workout-plans/generate
 */
generatedWorkoutPlanRouter.post(
    "/generate",
    authenticateToken,
    workoutGenerationLimiter,

    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {
        try {
            const authUser = req.authUser;

            if (!authUser) {
                res.status(401).json({
                    success: false,
                    message:
                        "Authentication is required",
                });
                return;
            }

            if (authUser.role !== "trainee") {
                res.status(403).json({
                    success: false,
                    message:
                        "Only trainees can generate personal workout plans",
                });
                return;
            }

            if (
                !mongoose.Types.ObjectId.isValid(
                    authUser.userId
                )
            ) {
                res.status(401).json({
                    success: false,
                    message:
                        "Invalid authenticated user",
                });
                return;
            }

            const user = await User.findById(
                authUser.userId
            );

            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User not found",
                });
                return;
            }

            if (!user.hasCompletedOnboarding) {
                res.status(400).json({
                    success: false,
                    message:
                        "Complete your trainee profile before generating a workout plan",
                });
                return;
            }

            /*
             * Avoid calling Gemini when an active plan already exists.
             */
            const existingActivePlan =
                await GeneratedWorkoutPlan.findOne({
                    userId: user._id,
                    status: "active",
                });

            if (existingActivePlan) {
                res.status(409).json({
                    success: false,
                    message:
                        "You already have an active generated workout plan",

                    plan: formatGeneratedWorkoutPlan(
                        existingActivePlan
                    ),
                });
                return;
            }

            const traineeProfile =
                await TraineeProfile.findOne({
                    userId: user._id,
                });

            if (!traineeProfile) {
                res.status(404).json({
                    success: false,
                    message:
                        "Trainee profile not found",
                });
                return;
            }

            const missingFields: string[] = [];

            if (!traineeProfile.fitnessLevel) missingFields.push("fitnessLevel");
            if (!traineeProfile.age || !Number.isInteger(traineeProfile.age)) missingFields.push("age");
            if (!traineeProfile.availableEquipment || traineeProfile.availableEquipment.length < 1) missingFields.push("availableEquipment");
            if (!traineeProfile.preferredWorkoutTime) missingFields.push("preferredWorkoutTime");
            if (!traineeProfile.sessionDurationMinutes) missingFields.push("sessionDurationMinutes");
            if (
                !Number.isInteger(traineeProfile.weeklyWorkouts) ||
                traineeProfile.weeklyWorkouts < 1 ||
                traineeProfile.weeklyWorkouts > 6
            ) missingFields.push("weeklyWorkouts");

            if (missingFields.length > 0) {
                res.status(409).json({
                    success: false,
                    message:
                        "Please complete your trainee profile before generating a workout plan",
                    missingFields,
                });
                return;
            }

            /*
             * Send only the required trainee information to Gemini.
             */
            const traineeContext: WorkoutGenerationTraineeContext =
            {
                fitnessLevel:
                    traineeProfile.fitnessLevel,

                goals:
                    traineeProfile.goals ?? [],

                weeklyWorkouts:
                    traineeProfile.weeklyWorkouts,

                height:
                    traineeProfile.height,

                weight:
                    traineeProfile.weight,

                age:
                    traineeProfile.age,

                gender:
                    traineeProfile.gender,

                availableEquipment:
                    traineeProfile.availableEquipment ?? [],

                medicalConditions:
                    traineeProfile.medicalConditions ?? [],

                medicalNotes:
                    traineeProfile.medicalNotes,

                preferredWorkoutTime:
                    traineeProfile.preferredWorkoutTime,

                sessionDurationMinutes:
                    traineeProfile.sessionDurationMinutes,
            };

            const generatedPlan =
                await generatePersonalizedWorkoutPlan(
                    traineeContext
                );

            /*
             * Add fields controlled by the server.
             */
            const savedPlan =
                await GeneratedWorkoutPlan.create({
                    userId: user._id,

                    title: generatedPlan.title,
                    description:
                        generatedPlan.description,

                    category:
                        generatedPlan.category,

                    difficulty:
                        generatedPlan.difficulty,

                    durationWeeks:
                        generatedPlan.durationWeeks,

                    workoutDaysPerWeek:
                        generatedPlan.workoutDaysPerWeek,

                    equipment:
                        generatedPlan.equipment,

                    status: "active",

                    requiresProfessionalReview:
                        generatedPlan.requiresProfessionalReview,

                    profileSnapshot: {
                        fitnessLevel:
                            traineeProfile.fitnessLevel,

                        goals:
                            traineeProfile.goals ?? [],

                        weeklyWorkouts:
                            traineeProfile.weeklyWorkouts,

                        height:
                            traineeProfile.height,

                        weight:
                            traineeProfile.weight,

                        age:
                            traineeProfile.age,

                        gender:
                            traineeProfile.gender,

                        availableEquipment:
                            traineeProfile.availableEquipment ?? [],

                        medicalConditions:
                            traineeProfile.medicalConditions ?? [],

                        medicalNotes:
                            traineeProfile.medicalNotes,

                        preferredWorkoutTime:
                            traineeProfile.preferredWorkoutTime,

                        sessionDurationMinutes:
                            traineeProfile.sessionDurationMinutes,
                    },

                    days: generatedPlan.days,
                });

            console.log("[WORKOUT_GEN] Generated workout plan saved");

            res.status(201).json({
                success: true,
                message:
                    "Workout plan generated successfully",

                plan:
                    formatGeneratedWorkoutPlan(savedPlan),
            });
        } catch (error) {
            if (
                error instanceof WorkoutGenerationError
            ) {
                sendWorkoutGenerationError(
                    error,
                    res
                );
                return;
            }

            /*
             * MongoDB duplicate-key error.
             */
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === 11000
            ) {
                res.status(409).json({
                    success: false,
                    message:
                        "You already have an active generated workout plan",
                });
                return;
            }

            if (
                error instanceof
                mongoose.Error.ValidationError
            ) {
                console.error(
                    "Generated workout plan validation failed:",
                    error.message
                );

                res.status(502).json({
                    success: false,
                    message:
                        "The generated workout plan could not be saved because it was invalid",
                });
                return;
            }

            console.error(
                "Failed to generate workout plan:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to generate workout plan",
            });
        }
    }
);

/*
 * GET /api/generated-workout-plans
 */
generatedWorkoutPlanRouter.get(
    "/",
    authenticateToken,

    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {
        try {
            const authUser = req.authUser;

            if (!authUser) {
                res.status(401).json({
                    success: false,
                    message:
                        "Authentication is required",
                });
                return;
            }

            if (authUser.role !== "trainee") {
                res.status(403).json({
                    success: false,
                    message:
                        "Only trainees can view generated workout plans",
                });
                return;
            }

            if (
                !mongoose.Types.ObjectId.isValid(
                    authUser.userId
                )
            ) {
                res.status(401).json({
                    success: false,
                    message:
                        "Invalid authenticated user",
                });
                return;
            }

            const plans =
                await GeneratedWorkoutPlan.find({
                    userId: authUser.userId,
                }).sort({
                    createdAt: -1,
                });

            res.status(200).json({
                success: true,

                plans: plans.map(
                    formatGeneratedWorkoutPlan
                ),
            });
        } catch (error) {
            console.error(
                "Failed to get generated workout plans:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to get generated workout plans",
            });
        }
    }
);

/*
 * GET /api/generated-workout-plans/:planId
 */
generatedWorkoutPlanRouter.get(
    "/:planId",
    authenticateToken,

    async (
        req: AuthenticatedRequest,
        res: Response
    ) => {
        try {
            const authUser = req.authUser;

            const rawPlanId = req.params.planId;

            const planId = Array.isArray(rawPlanId)
                ? rawPlanId[0]
                : rawPlanId;

            if (!authUser) {
                res.status(401).json({
                    success: false,
                    message: "Authentication is required",
                });
                return;
            }

            if (authUser.role !== "trainee") {
                res.status(403).json({
                    success: false,
                    message:
                        "Only trainees can view generated workout plans",
                });
                return;
            }

            if (
                !mongoose.Types.ObjectId.isValid(
                    authUser.userId
                )
            ) {
                res.status(401).json({
                    success: false,
                    message:
                        "Invalid authenticated user",
                });
                return;
            }

            if (!planId) {
                res.status(400).json({
                    success: false,
                    message:
                        "Workout plan ID is required",
                });
                return;
            }

            if (
                !mongoose.Types.ObjectId.isValid(
                    planId
                )
            ) {
                res.status(400).json({
                    success: false,
                    message:
                        "Invalid workout plan ID",
                });
                return;
            }

            const plan =
                await GeneratedWorkoutPlan.findOne({
                    _id: planId,
                    userId: authUser.userId,
                });

            res.status(200).json({
                success: true,

                plan:
                    formatGeneratedWorkoutPlan(plan),
            });
        } catch (error) {
            console.error(
                "Failed to get generated workout plan:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to get generated workout plan",
            });
        }
    }
);

export default generatedWorkoutPlanRouter;