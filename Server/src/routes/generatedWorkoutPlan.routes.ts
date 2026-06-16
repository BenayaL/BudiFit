import express, { Response } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import User from "../models/user.model";
import TraineeProfile from "../models/TraineeProfile.model";

import GeneratedWorkoutPlan, {
    IGeneratedWorkoutDay,
    IGeneratedWorkoutExercise,
    IGeneratedWorkoutPlan,
    GeneratedWorkoutPlanApprovalStatus,
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

import { createNotification } from "../helpers/notification.helper";
import { withMongoTransaction } from "../helpers/withTransaction";
import WorkoutPlanChangeRequest from "../models/workoutPlanChangeRequest.model";
import DailyWorkoutLog from "../models/dailyWorkoutLog.model";
import type { IDailyWorkoutLog } from "../models/dailyWorkoutLog.model";
import Notification from "../models/notification.model";
import { loadGeminiExercisePreferences } from "../services/exercisePreference.service";
import {
    isValidLocalDate,
    toDateString,
    getHistoricalEndDate,
    computePlanScheduleStats,
    getHistoryLabel,
    type PlanScheduleStats,
} from "../utils/dailyWorkoutPlan.helpers";

const generatedWorkoutPlanRouter = express.Router();

/*
 * Gemini requests are more expensive than ordinary API requests.
 */
const workoutGenerationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many workout generation requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ─── DTO formatters ───────────────────────────────────────────────────────────

/*
 * Summary DTO — no days or profileSnapshot.
 * Used in GET / list responses to keep payloads small.
 */
const HISTORICAL_STATUSES = new Set(["completed", "archived"]);

function formatSummaryDTO(
    plan: IGeneratedWorkoutPlan,
    hasPendingChangeRequest = false,
    historyStats?: PlanScheduleStats
) {
    const managedByCoach = !!plan.coachId;
    const approvalStatus = plan.approvalStatus ?? "not_required";
    const canViewDetails = approvalStatus !== "pending_review";
    const isHistorical = HISTORICAL_STATUSES.has(plan.status);

    const canComplete = !managedByCoach && plan.status === "active";
    const canRemove = !managedByCoach && plan.status === "active";
    const canRequestReplacement = !managedByCoach && plan.status === "active";
    // Permanently deleting a historical plan only clears the trainee's own
    // history — it is not a plan-management action, so it's allowed even for
    // coach-managed plans (e.g. one the coach removed or superseded).
    const canPermanentlyDelete = isHistorical;

    const base = {
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
        approvalStatus,
        requiresProfessionalReview: plan.requiresProfessionalReview,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
        managedByCoach,
        canViewDetails,
        canComplete,
        canRemove,
        canRequestReplacement,
        canPermanentlyDelete,
        hasPendingChangeRequest,
    };

    if (!isHistorical) return base;

    const historyEndedAt = getHistoricalEndDate(plan);
    return {
        ...base,
        completedAt: plan.completedAt,
        archivedAt: plan.archivedAt,
        archiveReason: plan.archiveReason,
        historyEndedAt,
        historyLabel: getHistoryLabel(plan.status, plan.archiveReason),
        scheduledWorkouts: historyStats?.scheduledWorkouts ?? 0,
        completedWorkouts: historyStats?.completedWorkouts ?? 0,
        missedWorkouts: historyStats?.missedWorkouts ?? 0,
        completionRate: historyStats?.completionRate ?? 0,
    };
}

/*
 * Full DTO — includes days and profileSnapshot.
 * Used in GET /:planId single-plan responses.
 */
function formatFullDTO(plan: IGeneratedWorkoutPlan) {
    return {
        ...formatSummaryDTO(plan),
        profileSnapshot: {
            fitnessLevel: plan.profileSnapshot.fitnessLevel,
            goals: plan.profileSnapshot.goals,
            weeklyWorkouts: plan.profileSnapshot.weeklyWorkouts,
            height: plan.profileSnapshot.height,
            weight: plan.profileSnapshot.weight,
            age: plan.profileSnapshot.age,
            gender: plan.profileSnapshot.gender,
            availableEquipment: plan.profileSnapshot.availableEquipment,
            medicalConditions: plan.profileSnapshot.medicalConditions,
            medicalNotes: plan.profileSnapshot.medicalNotes,
            preferredWorkoutTime: plan.profileSnapshot.preferredWorkoutTime,
            sessionDurationMinutes: plan.profileSnapshot.sessionDurationMinutes,
        },
        days: plan.days.map((day: IGeneratedWorkoutDay) => ({
            id: day._id ? String(day._id) : undefined,
            dayNumber: day.dayNumber,
            title: day.title,
            restDay: day.restDay,
            durationMinutes: day.durationMinutes,
            exercises: day.exercises.map((exercise: IGeneratedWorkoutExercise) => ({
                id: exercise._id ? String(exercise._id) : undefined,
                order: exercise.order,
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                durationSec: exercise.durationSec,
                restSec: exercise.restSec,
                equipment: exercise.equipment,
                notes: exercise.notes,
            })),
        })),
    };
}

/*
 * Convert classified Gemini errors into HTTP responses.
 */
function sendWorkoutGenerationError(error: WorkoutGenerationError, res: Response): void {
    switch (error.code) {
        case "AI_NOT_CONFIGURED":
            res.status(500).json({ success: false, message: error.message });
            return;
        case "AI_RATE_LIMITED":
            res.status(429).json({ success: false, message: error.message });
            return;
        case "AI_UNAVAILABLE":
            res.status(503).json({ success: false, message: error.message });
            return;
        case "EMPTY_AI_RESPONSE":
        case "INVALID_AI_JSON":
        case "INVALID_AI_STRUCTURE":
        case "INVALID_AI_PLAN":
            res.status(502).json({
                success: false,
                message: "The AI returned an invalid workout plan. Please try again.",
            });
            return;
        case "AI_GENERATION_FAILED":
        default:
            res.status(502).json({ success: false, message: "Failed to generate workout plan" });
    }
}

// ─── Guard: trainee only ──────────────────────────────────────────────────────

function requireTrainee(req: AuthenticatedRequest, res: Response): boolean {
    if (!req.authUser) {
        res.status(401).json({ success: false, message: "Authentication is required" });
        return false;
    }
    if (req.authUser.role !== "trainee") {
        res.status(403).json({ success: false, message: "Only trainees can access workout plans" });
        return false;
    }
    if (!mongoose.Types.ObjectId.isValid(req.authUser.userId)) {
        res.status(401).json({ success: false, message: "Invalid authenticated user" });
        return false;
    }
    return true;
}

// ─── POST /api/generated-workout-plans/generate ───────────────────────────────

generatedWorkoutPlanRouter.post(
    "/generate",
    authenticateToken,
    workoutGenerationLimiter,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!requireTrainee(req, res)) return;

            const user = await User.findById(req.authUser!.userId);
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }

            if (!user.hasCompletedOnboarding) {
                res.status(400).json({
                    success: false,
                    message: "Complete your trainee profile before generating a workout plan",
                });
                return;
            }

            const hasCoach = !!user.coachId;

            // Check for existing plan that blocks generation.
            // Without a coach: block if active plan exists.
            // With a coach: block if pending_review plan exists.
            if (hasCoach) {
                const existingDraft = await GeneratedWorkoutPlan.findOne({
                    userId: user._id,
                    status: "draft",
                    approvalStatus: "pending_review",
                });
                if (existingDraft) {
                    res.status(409).json({
                        success: false,
                        message: "A plan is already awaiting coach review",
                    });
                    return;
                }
            } else {
                const existingActivePlan = await GeneratedWorkoutPlan.findOne({
                    userId: user._id,
                    status: "active",
                });
                if (existingActivePlan) {
                    res.status(409).json({
                        success: false,
                        message: "You already have an active generated workout plan",
                        plan: formatSummaryDTO(existingActivePlan as unknown as IGeneratedWorkoutPlan),
                    });
                    return;
                }
            }

            const traineeProfile = await TraineeProfile.findOne({ userId: user._id });
            if (!traineeProfile) {
                res.status(404).json({ success: false, message: "Trainee profile not found" });
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
                    message: "Please complete your trainee profile before generating a workout plan",
                    missingFields,
                });
                return;
            }

            const { likedExercises, dislikedExercises } = await loadGeminiExercisePreferences(user._id);

            const traineeContext: WorkoutGenerationTraineeContext = {
                fitnessLevel: traineeProfile.fitnessLevel,
                goals: traineeProfile.goals ?? [],
                weeklyWorkouts: traineeProfile.weeklyWorkouts,
                height: traineeProfile.height,
                weight: traineeProfile.weight,
                age: traineeProfile.age,
                gender: traineeProfile.gender,
                availableEquipment: traineeProfile.availableEquipment ?? [],
                medicalConditions: traineeProfile.medicalConditions ?? [],
                medicalNotes: traineeProfile.medicalNotes,
                preferredWorkoutTime: traineeProfile.preferredWorkoutTime,
                sessionDurationMinutes: traineeProfile.sessionDurationMinutes,
                likedExercises,
                dislikedExercises,
            };

            const generatedPlan = await generatePersonalizedWorkoutPlan(traineeContext);

            const savedPlan = await GeneratedWorkoutPlan.create({
                userId: user._id,
                coachId: hasCoach ? user.coachId : undefined,
                title: generatedPlan.title,
                description: generatedPlan.description,
                category: generatedPlan.category,
                difficulty: generatedPlan.difficulty,
                durationWeeks: generatedPlan.durationWeeks,
                workoutDaysPerWeek: generatedPlan.workoutDaysPerWeek,
                equipment: generatedPlan.equipment,
                // Draft for coached trainees, active for uncoached
                status: hasCoach ? "draft" : "active",
                approvalStatus: hasCoach ? "pending_review" : "not_required",
                requiresProfessionalReview: generatedPlan.requiresProfessionalReview,
                profileSnapshot: {
                    fitnessLevel: traineeProfile.fitnessLevel,
                    goals: traineeProfile.goals ?? [],
                    weeklyWorkouts: traineeProfile.weeklyWorkouts,
                    height: traineeProfile.height,
                    weight: traineeProfile.weight,
                    age: traineeProfile.age,
                    gender: traineeProfile.gender,
                    availableEquipment: traineeProfile.availableEquipment ?? [],
                    medicalConditions: traineeProfile.medicalConditions ?? [],
                    medicalNotes: traineeProfile.medicalNotes,
                    preferredWorkoutTime: traineeProfile.preferredWorkoutTime,
                    sessionDurationMinutes: traineeProfile.sessionDurationMinutes,
                },
                days: generatedPlan.days,
                lastModifiedBy: "gemini",
                version: 1,
            });

            console.log("[WORKOUT_GEN] Generated workout plan saved");

            // Notify coach if plan needs review
            if (hasCoach) {
                await createNotification({
                    recipientId: user.coachId!,
                    type: "plan_pending_review",
                    message: `${user.firstName} ${user.lastName} generated a new workout plan for your review.`,
                    planId: savedPlan._id as mongoose.Types.ObjectId,
                });
            }

            res.status(201).json({
                success: true,
                message: hasCoach
                    ? "Workout plan generated and sent to your coach for review"
                    : "Workout plan generated successfully",
                plan: formatSummaryDTO(savedPlan as unknown as IGeneratedWorkoutPlan),
            });
        } catch (error) {
            if (error instanceof WorkoutGenerationError) {
                sendWorkoutGenerationError(error, res);
                return;
            }

            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === 11000
            ) {
                res.status(409).json({
                    success: false,
                    message: "A plan already exists that prevents generating a new one",
                });
                return;
            }

            if (error instanceof mongoose.Error.ValidationError) {
                console.error("Generated workout plan validation failed:", error.message);
                res.status(502).json({
                    success: false,
                    message: "The generated workout plan could not be saved because it was invalid",
                });
                return;
            }

            console.error("Failed to generate workout plan:", error);
            res.status(500).json({ success: false, message: "Failed to generate workout plan" });
        }
    }
);

// ─── GET /api/generated-workout-plans ────────────────────────────────────────

generatedWorkoutPlanRouter.get(
    "/",
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!requireTrainee(req, res)) return;

            const statusFilter = req.query.status as string | undefined;
            const isHistoryRequest = statusFilter === "history" || statusFilter === "completed";

            if (isHistoryRequest) {
                const localDateParam = req.query.localDate;
                if (localDateParam !== undefined && !isValidLocalDate(localDateParam)) {
                    res.status(400).json({ success: false, message: "Invalid localDate. Expected YYYY-MM-DD." });
                    return;
                }
                const localDate = isValidLocalDate(localDateParam) ? localDateParam : toDateString(new Date());

                // Backward-compatible: status=completed returns only completed plans.
                const historyStatusQuery =
                    statusFilter === "completed" ? "completed" : { $in: ["completed", "archived"] };

                const plans = await GeneratedWorkoutPlan.find({
                    userId: req.authUser!.userId,
                    status: historyStatusQuery,
                });

                if (plans.length === 0) {
                    res.status(200).json({ success: true, plans: [] });
                    return;
                }

                const planIds = plans.map((p) => p._id);
                const logs = (await DailyWorkoutLog.find({
                    userId: req.authUser!.userId,
                    planId: { $in: planIds },
                })) as unknown as IDailyWorkoutLog[];

                const logsByPlanId = new Map<string, Set<string>>();
                for (const log of logs) {
                    const key = log.planId.toString();
                    const set = logsByPlanId.get(key) ?? new Set<string>();
                    set.add(log.workoutDate);
                    logsByPlanId.set(key, set);
                }

                const planDTOs = plans.map((p) => {
                    const plan = p as unknown as IGeneratedWorkoutPlan;
                    const historicalEnd = getHistoricalEndDate(plan);
                    const completedDates = logsByPlanId.get(String(plan._id)) ?? new Set<string>();
                    const stats = computePlanScheduleStats(plan, completedDates, localDate, historicalEnd);
                    return { plan, historicalEnd, stats };
                });

                // Sort newest historical end first
                planDTOs.sort((a, b) => b.historicalEnd.localeCompare(a.historicalEnd));

                res.status(200).json({
                    success: true,
                    plans: planDTOs.map(({ plan, stats }) => formatSummaryDTO(plan, false, stats)),
                });
                return;
            }

            const planQuery: Record<string, unknown> = {
                userId: req.authUser!.userId,
                status: { $nin: ["archived", "completed"] },
            };

            const plans = await GeneratedWorkoutPlan.find(planQuery).sort({ createdAt: -1 });

            // Batch-load pending change requests so each plan DTO knows its pending state
            let pendingPlanIds = new Set<string>();
            if (plans.length > 0) {
                const pending = await WorkoutPlanChangeRequest.find(
                    {
                        traineeId: req.authUser!.userId,
                        planId: { $in: plans.map((p) => p._id) },
                        status: "pending",
                    },
                    "planId"
                );
                pendingPlanIds = new Set(pending.map((r) => String(r.planId)));
            }

            res.status(200).json({
                success: true,
                plans: plans.map((p) =>
                    formatSummaryDTO(
                        p as unknown as IGeneratedWorkoutPlan,
                        pendingPlanIds.has(String(p._id))
                    )
                ),
            });
        } catch (error) {
            console.error("Failed to get generated workout plans:", error);
            res.status(500).json({ success: false, message: "Failed to get generated workout plans" });
        }
    }
);

// ─── GET /api/generated-workout-plans/:planId ─────────────────────────────────

generatedWorkoutPlanRouter.get(
    "/:planId",
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!requireTrainee(req, res)) return;

            const planId = (req.params.planId as string);

            if (!mongoose.Types.ObjectId.isValid(planId)) {
                res.status(400).json({ success: false, message: "Invalid workout plan ID" });
                return;
            }

            const plan = await GeneratedWorkoutPlan.findOne({
                _id: planId,
                userId: req.authUser!.userId,
            });

            if (!plan) {
                res.status(404).json({ success: false, message: "Workout plan not found" });
                return;
            }

            const approvalStatus = (plan as unknown as IGeneratedWorkoutPlan).approvalStatus ?? "not_required";

            // Trainee cannot view a plan that is pending coach review
            if (approvalStatus === "pending_review") {
                res.status(403).json({
                    success: false,
                    message: "This plan is awaiting coach review and cannot be viewed yet",
                });
                return;
            }

            res.status(200).json({
                success: true,
                plan: formatFullDTO(plan as unknown as IGeneratedWorkoutPlan),
            });
        } catch (error) {
            console.error("Failed to get generated workout plan:", error);
            res.status(500).json({ success: false, message: "Failed to get generated workout plan" });
        }
    }
);

// ─── POST /api/generated-workout-plans/:planId/complete ───────────────────────

generatedWorkoutPlanRouter.post(
    "/:planId/complete",
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!requireTrainee(req, res)) return;

            const user = await User.findById(req.authUser!.userId, { coachId: 1 });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }

            if (user.coachId) {
                res.status(403).json({
                    success: false,
                    message: "Coached trainees cannot self-manage plans. Contact your coach.",
                });
                return;
            }

            const planId = (req.params.planId as string);
            if (!mongoose.Types.ObjectId.isValid(planId)) {
                res.status(400).json({ success: false, message: "Invalid plan ID" });
                return;
            }

            const plan = await GeneratedWorkoutPlan.findOne({
                _id: planId,
                userId: req.authUser!.userId,
                status: "active",
            });

            if (!plan) {
                res.status(404).json({ success: false, message: "Active plan not found" });
                return;
            }

            plan.set("status", "completed");
            plan.set("completedAt", new Date());
            await plan.save();

            res.status(200).json({
                success: true,
                plan: formatSummaryDTO(plan as unknown as IGeneratedWorkoutPlan),
            });
        } catch (error) {
            console.error("Failed to complete plan:", error);
            res.status(500).json({ success: false, message: "Failed to complete plan" });
        }
    }
);

// ─── DELETE /api/generated-workout-plans/:planId ──────────────────────────────

generatedWorkoutPlanRouter.delete(
    "/:planId",
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!requireTrainee(req, res)) return;

            const user = await User.findById(req.authUser!.userId, { coachId: 1 });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }

            if (user.coachId) {
                res.status(403).json({
                    success: false,
                    message: "Coached trainees cannot delete plans. Ask your coach.",
                });
                return;
            }

            const planId = (req.params.planId as string);
            if (!mongoose.Types.ObjectId.isValid(planId)) {
                res.status(400).json({ success: false, message: "Invalid plan ID" });
                return;
            }

            const archived = await GeneratedWorkoutPlan.findOneAndUpdate(
                {
                    _id: planId,
                    userId: req.authUser!.userId,
                    status: "active",
                },
                {
                    $set: {
                        status: "archived",
                        archivedAt: new Date(),
                        archiveReason: "removed_by_trainee",
                    },
                }
            );

            if (!archived) {
                res.status(404).json({ success: false, message: "Plan not found or cannot be removed" });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error("Failed to remove plan:", error);
            res.status(500).json({ success: false, message: "Failed to remove plan" });
        }
    }
);

// ─── DELETE /api/generated-workout-plans/:planId/permanent ────────────────────

generatedWorkoutPlanRouter.delete(
    "/:planId/permanent",
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!requireTrainee(req, res)) return;

            const planId = (req.params.planId as string);
            if (!mongoose.Types.ObjectId.isValid(planId)) {
                res.status(400).json({ success: false, message: "Invalid plan ID" });
                return;
            }

            const plan = await GeneratedWorkoutPlan.findOne({
                _id: planId,
                userId: req.authUser!.userId,
            });

            if (!plan) {
                res.status(404).json({ success: false, message: "Plan not found" });
                return;
            }

            if (plan.status !== "completed" && plan.status !== "archived") {
                res.status(409).json({
                    success: false,
                    message: "Only completed or archived plans can be permanently deleted",
                });
                return;
            }

            await withMongoTransaction(async (session) => {
                const opts = { session: session ?? undefined };
                await GeneratedWorkoutPlan.deleteOne({ _id: plan._id }, opts);
                await DailyWorkoutLog.deleteMany(
                    { userId: req.authUser!.userId, planId: plan._id },
                    opts
                );
                await WorkoutPlanChangeRequest.deleteMany({ planId: plan._id }, opts);
                // Notifications reference the plan informationally — unset the
                // pointer rather than deleting the notification itself so the
                // trainee's notification history stays intact.
                await Notification.updateMany(
                    { planId: plan._id },
                    { $unset: { planId: 1 } },
                    opts
                );
            });

            res.status(204).send();
        } catch (error) {
            console.error("Failed to permanently delete plan:", error);
            res.status(500).json({ success: false, message: "Failed to permanently delete plan" });
        }
    }
);

// ─── POST /api/generated-workout-plans/:planId/replace ────────────────────────

generatedWorkoutPlanRouter.post(
    "/:planId/replace",
    authenticateToken,
    workoutGenerationLimiter,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!requireTrainee(req, res)) return;

            const user = await User.findById(req.authUser!.userId);
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }

            if (user.coachId) {
                res.status(403).json({
                    success: false,
                    message: "Coached trainees cannot replace plans. Ask your coach.",
                });
                return;
            }

            const planId = (req.params.planId as string);
            if (!mongoose.Types.ObjectId.isValid(planId)) {
                res.status(400).json({ success: false, message: "Invalid plan ID" });
                return;
            }

            const reason = req.body?.reason;
            if (reason !== "completed" && reason !== "not_suitable") {
                res.status(400).json({
                    success: false,
                    message: "reason must be \"completed\" or \"not_suitable\"",
                });
                return;
            }

            const oldPlan = await GeneratedWorkoutPlan.findOne({
                _id: planId,
                userId: req.authUser!.userId,
                status: { $in: ["active", "completed"] },
            });

            if (!oldPlan) {
                res.status(404).json({ success: false, message: "Plan not found or cannot be replaced" });
                return;
            }

            const traineeProfile = await TraineeProfile.findOne({ userId: user._id });
            if (!traineeProfile) {
                res.status(404).json({ success: false, message: "Trainee profile not found" });
                return;
            }

            const { likedExercises, dislikedExercises } = await loadGeminiExercisePreferences(user._id);

            const traineeContext: WorkoutGenerationTraineeContext = {
                fitnessLevel: traineeProfile.fitnessLevel,
                goals: traineeProfile.goals ?? [],
                weeklyWorkouts: traineeProfile.weeklyWorkouts,
                height: traineeProfile.height,
                weight: traineeProfile.weight,
                age: traineeProfile.age,
                gender: traineeProfile.gender,
                availableEquipment: traineeProfile.availableEquipment ?? [],
                medicalConditions: traineeProfile.medicalConditions ?? [],
                medicalNotes: traineeProfile.medicalNotes,
                preferredWorkoutTime: traineeProfile.preferredWorkoutTime,
                sessionDurationMinutes: traineeProfile.sessionDurationMinutes,
                likedExercises,
                dislikedExercises,
            };

            const generatedPlan = await generatePersonalizedWorkoutPlan(traineeContext);

            // Archive (or complete) old plan, then create the new one
            const newPlanDoc = {
                userId: user._id,
                title: generatedPlan.title,
                description: generatedPlan.description,
                category: generatedPlan.category,
                difficulty: generatedPlan.difficulty,
                durationWeeks: generatedPlan.durationWeeks,
                workoutDaysPerWeek: generatedPlan.workoutDaysPerWeek,
                equipment: generatedPlan.equipment,
                status: "active",
                approvalStatus: "not_required",
                requiresProfessionalReview: generatedPlan.requiresProfessionalReview,
                profileSnapshot: {
                    fitnessLevel: traineeProfile.fitnessLevel,
                    goals: traineeProfile.goals ?? [],
                    weeklyWorkouts: traineeProfile.weeklyWorkouts,
                    height: traineeProfile.height,
                    weight: traineeProfile.weight,
                    age: traineeProfile.age,
                    gender: traineeProfile.gender,
                    availableEquipment: traineeProfile.availableEquipment ?? [],
                    medicalConditions: traineeProfile.medicalConditions ?? [],
                    medicalNotes: traineeProfile.medicalNotes,
                    preferredWorkoutTime: traineeProfile.preferredWorkoutTime,
                    sessionDurationMinutes: traineeProfile.sessionDurationMinutes,
                },
                days: generatedPlan.days,
                lastModifiedBy: "gemini",
                version: 1,
            };

            const [newPlan] = await withMongoTransaction(async (session) => {
                const opts = { session: session ?? undefined };
                if (reason === "completed") {
                    await GeneratedWorkoutPlan.updateOne(
                        { _id: oldPlan._id },
                        { $set: { status: "completed", completedAt: new Date() } },
                        opts
                    );
                } else {
                    await GeneratedWorkoutPlan.updateOne(
                        { _id: oldPlan._id },
                        {
                            $set: {
                                status: "archived",
                                archivedAt: new Date(),
                                archiveReason: "replaced_not_suitable",
                            },
                        },
                        opts
                    );
                }
                return GeneratedWorkoutPlan.create([newPlanDoc], opts);
            });

            res.status(201).json({
                success: true,
                message: "Workout plan replaced successfully",
                plan: formatSummaryDTO(newPlan as unknown as IGeneratedWorkoutPlan),
            });
        } catch (error) {
            if (error instanceof WorkoutGenerationError) {
                sendWorkoutGenerationError(error, res);
                return;
            }
            console.error("Failed to replace plan:", error);
            res.status(500).json({ success: false, message: "Failed to replace plan" });
        }
    }
);

// ─── POST /api/generated-workout-plans/:planId/request-change ─────────────────

generatedWorkoutPlanRouter.post(
    "/:planId/request-change",
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!requireTrainee(req, res)) return;

            // Validate message from request body
            const rawMessage =
                typeof req.body.message === "string" ? req.body.message.trim() : "";
            if (!rawMessage) {
                res.status(400).json({
                    success: false,
                    message: "Please describe what you would like your coach to change.",
                });
                return;
            }
            if (rawMessage.length > 1000) {
                res.status(400).json({
                    success: false,
                    message: "Message must not exceed 1000 characters.",
                });
                return;
            }

            const user = await User.findById(req.authUser!.userId, {
                coachId: 1,
                firstName: 1,
                lastName: 1,
            });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }

            if (!user.coachId) {
                res.status(403).json({
                    success: false,
                    message: "You are not currently connected to a coach.",
                });
                return;
            }

            const planId = req.params.planId as string;
            if (!mongoose.Types.ObjectId.isValid(planId)) {
                res.status(400).json({ success: false, message: "Invalid plan ID" });
                return;
            }

            const plan = await GeneratedWorkoutPlan.findOne({
                _id: planId,
                userId: req.authUser!.userId,
                status: "active",
            });

            if (!plan) {
                res.status(404).json({
                    success: false,
                    message: "The workout plan could not be found.",
                });
                return;
            }

            // One pending request per plan — reject duplicates
            const existing = await WorkoutPlanChangeRequest.findOne({
                traineeId: req.authUser!.userId,
                planId: plan._id,
                status: "pending",
            });
            if (existing) {
                res.status(409).json({
                    success: false,
                    message: "You already have a pending change request for this plan.",
                });
                return;
            }

            const changeRequest = await WorkoutPlanChangeRequest.create({
                traineeId: req.authUser!.userId,
                coachId: user.coachId,
                planId: plan._id,
                message: rawMessage,
                status: "pending",
            });

            await createNotification({
                recipientId: user.coachId,
                type: "plan_change_requested",
                message: `${user.firstName} ${user.lastName} requested changes to "${plan.title}".`,
                planId: plan._id as mongoose.Types.ObjectId,
            });

            res.status(201).json({
                success: true,
                message: "Change request sent to your coach",
                changeRequestId: String(changeRequest._id),
            });
        } catch (error) {
            // Partial unique index race condition — two simultaneous requests
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                (error as { code: unknown }).code === 11000
            ) {
                res.status(409).json({
                    success: false,
                    message: "You already have a pending change request for this plan.",
                });
                return;
            }
            console.error("Failed to request plan change:", error);
            res.status(500).json({
                success: false,
                message: "The request could not be sent. Please try again.",
            });
        }
    }
);

export default generatedWorkoutPlanRouter;
