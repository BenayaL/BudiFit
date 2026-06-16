// Routes matching ENDPOINTS.coach in the client:
//   GET    /api/coach/dashboard
//   GET    /api/coach/trainees
//   GET    /api/coach/trainees/:traineeId
//   GET    /api/coach/plans
//   GET    /api/coach/plans/:planId
//   PUT    /api/coach/plans/:planId
//   POST   /api/coach/plans/:planId/approve
//   DELETE /api/coach/plans/:planId
//   POST   /api/coach/trainees/:traineeId/plans/generate

import { Router, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import User from "../models/user.model";
import type { IUser } from "../models/user.model";
import GeneratedWorkoutPlan from "../models/generatedWorkoutPlan.model";
import type { IGeneratedWorkoutPlan, IGeneratedWorkoutDay, IGeneratedWorkoutExercise } from "../models/generatedWorkoutPlan.model";
import TraineeProfile from "../models/TraineeProfile.model";
import type { ITraineeProfile } from "../models/TraineeProfile.model";
import DailyWorkoutLog from "../models/dailyWorkoutLog.model";
import type { IDailyWorkoutLog } from "../models/dailyWorkoutLog.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";
import { createNotification } from "../helpers/notification.helper";
import WorkoutPlanChangeRequest from "../models/workoutPlanChangeRequest.model";
import {
  generatePersonalizedWorkoutPlan,
  WorkoutGenerationError,
  type WorkoutGenerationTraineeContext,
} from "../services/generatedWorkoutPlan.service";
import {
  toDateString,
  offsetDate,
  getDayNumber,
  findPlanDay,
  getPlanWindow,
  calculateStreak,
  isValidLocalDate,
} from "../utils/dailyWorkoutPlan.helpers";
import { loadGeminiExercisePreferences } from "../services/exercisePreference.service";

const router = Router();

// Guard: coaches only
function requireCoach(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.authUser?.role !== "coach") {
    res.status(403).json({ message: "Coach access only" });
    return;
  }
  next();
}

router.use(authenticateToken);
router.use(requireCoach);

// ─── DTO types ────────────────────────────────────────────────────────────────

interface CoachDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "coach";
  assignedTraineeIds: string[];
}

interface TraineeDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "trainee";
  level: string;
  color: string;
  status: "active" | "needs_attention" | "inactive";
  streakDays: number;
  completedChallenges: number;
  missedWorkouts: number;
  weeklyActivity: number[];
  goals: string[];
}

interface CoachPlanExerciseDTO {
  id: string;
  order: number;
  name: string;
  sets?: number;
  reps?: string;
  durationSec?: number;
  restSec?: number;
  equipment: string;
  notes?: string;
}

interface CoachPlanDayDTO {
  id: string;
  dayNumber: number;
  title: string;
  restDay: boolean;
  durationMinutes: number;
  exercises: CoachPlanExerciseDTO[];
}

interface CoachGeneratedPlanDTO {
  id: string;
  traineeId: string;
  traineeName: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  durationWeeks: number;
  workoutDaysPerWeek: number;
  equipment: string[];
  status: string;
  approvalStatus: string;
  requiresProfessionalReview: boolean;
  days: CoachPlanDayDTO[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Plan update validation schema ───────────────────────────────────────────

const exerciseUpdateSchema = z
  .object({
    id: z.string().optional(),
    order: z.number().int().min(1).max(50),
    name: z.string().trim().min(1).max(120),
    sets: z.number().int().min(1).max(20).optional(),
    reps: z.string().trim().max(40).optional(),
    durationSec: z.number().int().min(0).max(7200).optional(),
    restSec: z.number().int().min(0).max(1800).optional(),
    equipment: z.string().trim().min(1).max(100),
    notes: z.string().trim().max(500).optional(),
  })
  .superRefine((ex, ctx) => {
    if (ex.sets === undefined && ex.reps === undefined && ex.durationSec === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exercise must include sets, reps, or durationSec",
      });
    }
  });

const dayUpdateSchema = z
  .object({
    id: z.string().optional(),
    dayNumber: z.number().int().min(1).max(7),
    title: z.string().trim().min(1).max(120),
    restDay: z.boolean(),
    durationMinutes: z.number().int().min(0).max(300),
    exercises: z.array(exerciseUpdateSchema).max(20),
  })
  .superRefine((day, ctx) => {
    if (day.restDay && day.exercises.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exercises"],
        message: "A rest day cannot contain exercises",
      });
    }
    if (!day.restDay && day.exercises.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exercises"],
        message: "A workout day must contain at least one exercise",
      });
    }
    if (day.restDay && day.durationMinutes !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationMinutes"],
        message: "A rest day must have durationMinutes equal to 0",
      });
    }
    if (!day.restDay && day.durationMinutes < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["durationMinutes"],
        message: "A workout day must have a positive duration",
      });
    }
  });

const updatePlanBodySchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(5000).optional(),
    category: z
      .enum(["strength", "hypertrophy", "endurance", "general_fitness", "mobility", "weight_loss"])
      .optional(),
    difficulty: z.number().int().min(1).max(5).optional(),
    durationWeeks: z.number().int().min(1).max(12).optional(),
    workoutDaysPerWeek: z.number().int().min(1).max(7).optional(),
    equipment: z.array(z.string().trim().min(1).max(100)).max(30).optional(),
    days: z.array(dayUpdateSchema).min(1).max(7).optional(),
  })
  .superRefine((body, ctx) => {
    if (body.days !== undefined && body.workoutDaysPerWeek !== undefined) {
      const nonRestCount = body.days.filter((d) => !d.restDay).length;
      if (nonRestCount !== body.workoutDaysPerWeek) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["days"],
          message: `Non-rest days (${nonRestCount}) must equal workoutDaysPerWeek (${body.workoutDaysPerWeek})`,
        });
      }
    }
  });

// ─── Deterministic avatar color from userId ───────────────────────────────────

const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f59e0b", "#ef4444", "#10b981", "#3b82f6",
];

function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── DTO mappers ──────────────────────────────────────────────────────────────

function toCoachDTO(coach: IUser, traineeIds: string[]): CoachDTO {
  return {
    userId: coach._id.toString(),
    firstName: coach.firstName,
    lastName: coach.lastName,
    email: coach.email,
    role: "coach",
    assignedTraineeIds: traineeIds,
  };
}

/**
 * Builds a trainee's stat DTO from their active generated plan and their
 * DailyWorkoutLog completions. Mirrors the scheduling/streak/window rules
 * used by dailyWorkout.routes.ts (shared via dailyWorkoutPlan.helpers) so
 * the trainee-facing calendar and the coach dashboard never disagree.
 */
function toTraineeDTO(
  user: IUser,
  profile: ITraineeProfile | undefined,
  activePlan: IGeneratedWorkoutPlan | null,
  logs: IDailyWorkoutLog[],
  todayStr: string
): TraineeDTO {
  const userId = user._id.toString();

  // completedChallenges = all-time completed daily-workout logs (any plan)
  const completedChallenges = logs.length;

  let missedWorkouts = 0;
  let streakDays = 0;

  if (activePlan) {
    const planId = (activePlan as unknown as { _id: { toString(): string } })._id.toString();
    const planCompletedDates = new Set(
      logs.filter((l) => l.planId.toString() === planId).map((l) => l.workoutDate)
    );

    // Only past dates within the plan's active window count as missed.
    const { startDate, endDate } = getPlanWindow(activePlan);
    const missedRangeEnd = todayStr < endDate ? todayStr : endDate;
    for (let cursor = startDate; cursor < missedRangeEnd; cursor = offsetDate(cursor, 1)) {
      const planDay = findPlanDay(activePlan, cursor);
      if (planDay && !planDay.restDay && !planCompletedDates.has(cursor)) {
        missedWorkouts++;
      }
    }

    streakDays = calculateStreak(planCompletedDates, activePlan, todayStr);
  }

  // weeklyActivity: Monday..Sunday of the current week, all completed logs (any plan)
  const weekStart = offsetDate(todayStr, -(getDayNumber(todayStr) - 1));
  const countsByDate = new Map<string, number>();
  for (const l of logs) {
    countsByDate.set(l.workoutDate, (countsByDate.get(l.workoutDate) ?? 0) + 1);
  }
  const weeklyActivity: number[] = [];
  for (let i = 0; i < 7; i++) {
    weeklyActivity.push(countsByDate.get(offsetDate(weekStart, i)) ?? 0);
  }

  let status: "active" | "needs_attention" | "inactive";
  if (!activePlan) {
    status = "inactive";
  } else if (missedWorkouts > 0) {
    status = "needs_attention";
  } else {
    status = "active";
  }

  return {
    userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: "trainee",
    level: profile?.fitnessLevel ?? user.fitnessLevel ?? "Not set",
    color: getAvatarColor(userId),
    status,
    streakDays,
    completedChallenges,
    missedWorkouts,
    weeklyActivity,
    goals: (profile?.goals ?? user.goals ?? []) as string[],
  };
}

function toCoachPlanDTO(
  plan: IGeneratedWorkoutPlan,
  traineeFirstName: string,
  traineeLastName: string
): CoachGeneratedPlanDTO {
  return {
    id: plan._id.toString(),
    traineeId: plan.userId.toString(),
    traineeName: `${traineeFirstName} ${traineeLastName}`,
    title: plan.title,
    description: plan.description,
    category: plan.category,
    difficulty: plan.difficulty,
    durationWeeks: plan.durationWeeks,
    workoutDaysPerWeek: plan.workoutDaysPerWeek,
    equipment: plan.equipment,
    status: plan.status,
    approvalStatus: plan.approvalStatus ?? "not_required",
    requiresProfessionalReview: plan.requiresProfessionalReview,
    days: plan.days.map((day: IGeneratedWorkoutDay) => ({
      id: day._id ? String(day._id) : "",
      dayNumber: day.dayNumber,
      title: day.title,
      restDay: day.restDay,
      durationMinutes: day.durationMinutes,
      exercises: day.exercises.map((ex: IGeneratedWorkoutExercise) => ({
        id: ex._id ? String(ex._id) : "",
        order: ex.order,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        durationSec: ex.durationSec,
        restSec: ex.restSec,
        equipment: ex.equipment,
        notes: ex.notes,
      })),
    })),
    version: plan.version ?? 1,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

// ─── Batch trainee data loader ────────────────────────────────────────────────

async function loadTraineeDTOs(
  coachId: string,
  todayStr: string
): Promise<TraineeDTO[]> {
  const traineeUsers = await User.find(
    { coachId, role: "trainee" },
    { password: 0 }
  );

  if (traineeUsers.length === 0) return [];

  const traineeIds = traineeUsers.map((t) => t._id);

  const [profiles, activePlans, logs] = await Promise.all([
    TraineeProfile.find({ userId: { $in: traineeIds } }),
    GeneratedWorkoutPlan.find({ userId: { $in: traineeIds }, status: "active" }),
    DailyWorkoutLog.find({ userId: { $in: traineeIds } }),
  ]);

  const profileMap = new Map<string, ITraineeProfile>(
    profiles.map((p) => [p.userId.toString(), p as unknown as ITraineeProfile])
  );
  const planMap = new Map<string, IGeneratedWorkoutPlan>(
    activePlans.map((p) => [
      p.userId.toString(),
      p as unknown as IGeneratedWorkoutPlan,
    ])
  );
  const logsMap = new Map<string, IDailyWorkoutLog[]>();
  for (const log of logs) {
    const uid = log.userId.toString();
    const arr = logsMap.get(uid) ?? [];
    arr.push(log as unknown as IDailyWorkoutLog);
    logsMap.set(uid, arr);
  }

  return traineeUsers.map((user) =>
    toTraineeDTO(
      user as unknown as IUser,
      profileMap.get(user._id.toString()),
      planMap.get(user._id.toString()) ?? null,
      logsMap.get(user._id.toString()) ?? [],
      todayStr
    )
  );
}

// ─── GET /api/coach/dashboard ─────────────────────────────────────────────────

router.get("/dashboard", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.authUser!.userId;
    const localDate = req.query.localDate;
    if (localDate !== undefined && !isValidLocalDate(localDate)) {
      res.status(400).json({ message: "Invalid localDate. Expected YYYY-MM-DD." });
      return;
    }
    const todayStr = isValidLocalDate(localDate) ? localDate : toDateString(new Date());

    const coach = await User.findById(coachId, { password: 0 });
    if (!coach) {
      res.status(404).json({ message: "Coach not found" });
      return;
    }

    const [trainees, rawPendingPlans] = await Promise.all([
      loadTraineeDTOs(coachId, todayStr),
      GeneratedWorkoutPlan.find({ coachId, approvalStatus: "pending_review" }),
    ]);

    // For pending plans we need trainee names — build a name map from the already-loaded trainees
    const traineeNameMap = new Map<string, { firstName: string; lastName: string }>(
      trainees.map((t) => [t.userId, { firstName: t.firstName, lastName: t.lastName }])
    );

    const pendingPlans = rawPendingPlans.map((p) => {
      const plan = p as unknown as IGeneratedWorkoutPlan;
      const traineeId = plan.userId.toString();
      const name = traineeNameMap.get(traineeId) ?? { firstName: "Unknown", lastName: "" };
      return toCoachPlanDTO(plan, name.firstName, name.lastName);
    });

    res.status(200).json({
      coach: toCoachDTO(coach as unknown as IUser, trainees.map((t) => t.userId)),
      trainees,
      pendingPlans,
    });
  } catch (error) {
    console.error("Coach dashboard error:", error);
    res.status(500).json({ message: "Failed to get dashboard" });
  }
});

// ─── GET /api/coach/trainees ──────────────────────────────────────────────────

router.get("/trainees", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const localDate = req.query.localDate;
    if (localDate !== undefined && !isValidLocalDate(localDate)) {
      res.status(400).json({ message: "Invalid localDate. Expected YYYY-MM-DD." });
      return;
    }
    const todayStr = isValidLocalDate(localDate) ? localDate : toDateString(new Date());

    const trainees = await loadTraineeDTOs(req.authUser!.userId, todayStr);
    res.status(200).json(trainees);
  } catch (error) {
    console.error("Get trainees error:", error);
    res.status(500).json({ message: "Failed to get trainees" });
  }
});

// ─── GET /api/coach/trainees/:traineeId ───────────────────────────────────────

router.get(
  "/trainees/:traineeId",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const localDate = req.query.localDate;
      if (localDate !== undefined && !isValidLocalDate(localDate)) {
        res.status(400).json({ message: "Invalid localDate. Expected YYYY-MM-DD." });
        return;
      }
      const todayStr = isValidLocalDate(localDate) ? localDate : toDateString(new Date());

      const traineeUser = await User.findOne(
        {
          _id: (req.params.traineeId as string),
          role: "trainee",
          coachId: req.authUser!.userId,
        },
        { password: 0 }
      );
      if (!traineeUser) {
        res.status(404).json({ message: "Trainee not found" });
        return;
      }

      const [profile, activePlan, logs, rawPlans] = await Promise.all([
        TraineeProfile.findOne({ userId: traineeUser._id }),
        GeneratedWorkoutPlan.findOne({ userId: traineeUser._id, status: "active" }),
        DailyWorkoutLog.find({ userId: traineeUser._id }),
        GeneratedWorkoutPlan.find({
          userId: (req.params.traineeId as string),
          status: { $ne: "archived" },
        }).sort({ createdAt: -1 }),
      ]);

      const traineeDTO = toTraineeDTO(
        traineeUser as unknown as IUser,
        profile ? (profile as unknown as ITraineeProfile) : undefined,
        activePlan ? (activePlan as unknown as IGeneratedWorkoutPlan) : null,
        logs as unknown as IDailyWorkoutLog[],
        todayStr
      );

      const plans = rawPlans.map((p) =>
        toCoachPlanDTO(
          p as unknown as IGeneratedWorkoutPlan,
          traineeUser.firstName,
          traineeUser.lastName
        )
      );

      res.status(200).json({ trainee: traineeDTO, plans });
    } catch (error) {
      console.error("Get trainee details error:", error);
      res.status(500).json({ message: "Failed to get trainee details" });
    }
  }
);

// ─── GET /api/coach/plans ─────────────────────────────────────────────────────

router.get("/plans", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.authUser!.userId;
    const filterStatus = req.query.status as string | undefined;

    const query: Record<string, unknown> = {
      coachId,
      status: { $ne: "archived" },
    };

    if (filterStatus && ["draft", "active", "completed"].includes(filterStatus)) {
      query.status = filterStatus;
    }

    const plans = await GeneratedWorkoutPlan.find(query).sort({ createdAt: -1 });

    // Load trainee names for all plans
    const traineeIds = [...new Set(plans.map((p) => p.userId.toString()))];
    const traineeUsers = await User.find(
      { _id: { $in: traineeIds } },
      { firstName: 1, lastName: 1 }
    );
    const nameMap = new Map<string, { firstName: string; lastName: string }>(
      traineeUsers.map((u) => [u._id.toString(), { firstName: u.firstName, lastName: u.lastName }])
    );

    const planDTOs = plans.map((p) => {
      const plan = p as unknown as IGeneratedWorkoutPlan;
      const traineeId = plan.userId.toString();
      const name = nameMap.get(traineeId) ?? { firstName: "Unknown", lastName: "" };
      return toCoachPlanDTO(plan, name.firstName, name.lastName);
    });

    res.status(200).json(planDTOs);
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ message: "Failed to get plans" });
  }
});

// ─── GET /api/coach/plans/:planId ─────────────────────────────────────────────

router.get(
  "/plans/:planId",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid((req.params.planId as string))) {
        res.status(400).json({ message: "Invalid plan ID" });
        return;
      }

      const plan = await GeneratedWorkoutPlan.findOne({
        _id: (req.params.planId as string),
        coachId: req.authUser!.userId,
      });

      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }

      const traineeUser = await User.findById(plan.userId, { firstName: 1, lastName: 1 });
      const firstName = traineeUser?.firstName ?? "Unknown";
      const lastName = traineeUser?.lastName ?? "";

      res.status(200).json(
        toCoachPlanDTO(plan as unknown as IGeneratedWorkoutPlan, firstName, lastName)
      );
    } catch (error) {
      console.error("Get plan error:", error);
      res.status(500).json({ message: "Failed to get plan" });
    }
  }
);

// ─── PUT /api/coach/plans/:planId ─────────────────────────────────────────────

router.put(
  "/plans/:planId",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid((req.params.planId as string))) {
        res.status(400).json({ message: "Invalid plan ID" });
        return;
      }

      const parseResult = updatePlanBodySchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          message: "Invalid request body",
          errors: parseResult.error.flatten().fieldErrors,
        });
        return;
      }

      const updates = parseResult.data;

      const plan = await GeneratedWorkoutPlan.findOne({
        _id: (req.params.planId as string),
        coachId: req.authUser!.userId,
        status: { $in: ["draft", "active"] },
      });

      if (!plan) {
        res.status(404).json({ message: "Plan not found or cannot be edited" });
        return;
      }

      if (updates.title !== undefined) plan.set("title", updates.title);
      if (updates.description !== undefined) plan.set("description", updates.description);
      if (updates.category !== undefined) plan.set("category", updates.category);
      if (updates.difficulty !== undefined) plan.set("difficulty", updates.difficulty);
      if (updates.durationWeeks !== undefined) plan.set("durationWeeks", updates.durationWeeks);
      if (updates.workoutDaysPerWeek !== undefined) plan.set("workoutDaysPerWeek", updates.workoutDaysPerWeek);
      if (updates.equipment !== undefined) plan.set("equipment", updates.equipment);
      if (updates.days !== undefined) plan.set("days", updates.days);
      plan.set("lastModifiedBy", "coach");
      plan.set("version", ((plan as unknown as IGeneratedWorkoutPlan).version ?? 1) + 1);

      await plan.save();

      const traineeUser = await User.findById(plan.userId, { firstName: 1, lastName: 1 });
      const firstName = traineeUser?.firstName ?? "Unknown";
      const lastName = traineeUser?.lastName ?? "";

      // Notify trainee if plan is already active (approved). Non-blocking —
      // the plan is already saved, so a notification failure must not 500.
      const planDoc = plan as unknown as IGeneratedWorkoutPlan;
      if (planDoc.approvalStatus === "approved") {
        try {
          await createNotification({
            recipientId: plan.userId,
            type: "plan_edited_by_coach",
            message: "Your coach made changes to your workout plan.",
            planId: plan._id as mongoose.Types.ObjectId,
          });
        } catch (notifError) {
          console.error("Update plan: notification failed:", notifError);
        }
      }

      res.status(200).json(toCoachPlanDTO(planDoc, firstName, lastName));
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error("Update plan error:", error);
      res.status(500).json({ message: "Failed to update plan" });
    }
  }
);

// ─── POST /api/coach/plans/:planId/approve ────────────────────────────────────

router.post(
  "/plans/:planId/approve",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid((req.params.planId as string))) {
        res.status(400).json({ message: "Invalid plan ID" });
        return;
      }

      const coachId = req.authUser!.userId;

      // Find the plan without a coachId filter — authorization is done via trainee.coachId
      const plan = await GeneratedWorkoutPlan.findOne({
        _id: (req.params.planId as string),
        status: "draft",
        approvalStatus: "pending_review",
      });

      if (!plan) {
        res.status(404).json({ message: "Pending plan not found" });
        return;
      }

      // Authorize: verify the trainee's current coach is the authenticated coach
      const trainee = await User.findById(plan.userId);
      if (!trainee || trainee.role !== "trainee") {
        res.status(404).json({ message: "Trainee not found" });
        return;
      }
      if (String(trainee.coachId) !== coachId) {
        res.status(403).json({ message: "You are not the coach of this trainee" });
        return;
      }

      const currentVersion = (plan as unknown as IGeneratedWorkoutPlan).version ?? 1;
      const now = new Date();
      const coachOid = new mongoose.Types.ObjectId(coachId);

      /*
 * Archive the trainee's previous active plans first.
 *
 * We intentionally do not use a MongoDB transaction here because
 * the project may run with a local standalone MongoDB server.
 */
      await GeneratedWorkoutPlan.updateMany(
        {
          userId: trainee._id,
          status: "active",
          _id: { $ne: plan._id },
        },
        {
          $set: {
            status: "archived",
            archivedAt: now,
            archiveReason: "superseded_by_new_plan",
          },
        }
      );

      /*
       * Approve the selected pending plan.
       */
      const approvalResult =
        await GeneratedWorkoutPlan.updateOne(
          {
            _id: plan._id,
            status: "draft",
            approvalStatus: "pending_review",
          },
          {
            $set: {
              status: "active",
              approvalStatus: "approved",
              coachId: coachOid,
              reviewedByCoachId: coachOid,
              reviewedAt: now,
              lastModifiedBy: "coach",
              version: currentVersion + 1,
            },
            $unset: {
              archivedAt: 1,
            },
          }
        );

      if (approvalResult.matchedCount !== 1) {
        throw new Error(
          "The pending plan could not be found during approval"
        );
      }

      await createNotification({
        recipientId: plan.userId,
        type: "plan_approved",
        message: "Your coach approved your workout plan. You can now view and start it.",
        planId: plan._id as mongoose.Types.ObjectId,
      });

      // Build the response DTO from the in-memory document with the known changes
      // applied — avoids an extra round-trip since updateOne does not return the doc.
      const approvedPlan = plan as unknown as IGeneratedWorkoutPlan;
      approvedPlan.status = "active";
      approvedPlan.approvalStatus = "approved";
      approvedPlan.coachId = coachOid;
      approvedPlan.reviewedByCoachId = coachOid;
      approvedPlan.reviewedAt = now;
      approvedPlan.lastModifiedBy = "coach";
      approvedPlan.version = currentVersion + 1;

      res.status(200).json(
        toCoachPlanDTO(approvedPlan, trainee.firstName, trainee.lastName)
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: unknown }).code === 11000
      ) {
        res.status(409).json({ message: "A plan conflict prevented approval" });
        return;
      }
      const approveError = error as {
        name?: string;
        message?: string;
        code?: number;
        codeName?: string;
        stack?: string;
      };

      console.error("Approve plan error:", {
        name: approveError?.name,
        message: approveError?.message,
        code: approveError?.code,
        codeName: approveError?.codeName,
        stack: approveError?.stack,
      });

      res.status(500).json({
        message: "Failed to approve plan",
        error:
          approveError?.message ??
          String(error),
        code: approveError?.code,
      });
    }
  }
);

// ─── DELETE /api/coach/plans/:planId ─────────────────────────────────────────

router.delete(
  "/plans/:planId",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!mongoose.Types.ObjectId.isValid((req.params.planId as string))) {
        res.status(400).json({ message: "Invalid plan ID" });
        return;
      }

      // Load plan without coachId filter — auth via trainee.coachId
      const plan = await GeneratedWorkoutPlan.findOne({
        _id: (req.params.planId as string),
        status: { $in: ["draft", "active"] },
      });

      if (!plan) {
        res.status(404).json({ message: "Plan not found or cannot be deleted" });
        return;
      }

      // Authorize: trainee's current coach must be the authenticated coach
      const trainee = await User.findById(plan.userId);
      if (!trainee || String(trainee.coachId) !== req.authUser!.userId) {
        res.status(403).json({ message: "You are not the coach of this trainee" });
        return;
      }

      // Archive instead of destroying — preserves DailyWorkoutLogs and lets
      // the trainee still see this plan (and its missed days) in history.
      const archiveResult = await GeneratedWorkoutPlan.updateOne(
        { _id: plan._id },
        {
          $set: {
            status: "archived",
            archivedAt: new Date(),
            archiveReason: "removed_by_coach",
          },
        }
      );
      if (archiveResult.matchedCount !== 1) {
        res.status(500).json({ message: "Failed to remove plan" });
        return;
      }

      // Notify trainee — non-blocking; plan is already archived
      try {
        await createNotification({
          recipientId: plan.userId,
          type: "plan_deleted_by_coach",
          message: "Your coach removed your workout plan. You can generate a new one.",
        });
      } catch (notifError) {
        console.error("Archive plan: notification failed:", notifError);
      }

      res.status(204).send();
    } catch (error) {
      console.error("Delete plan error:", error);
      res.status(500).json({ message: "Failed to delete plan" });
    }
  }
);

// ─── POST /api/coach/trainees/:traineeId/plans/generate ───────────────────────

router.post(
  "/trainees/:traineeId/plans/generate",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coachId = req.authUser!.userId;
      const traineeId = req.params.traineeId as string;

      if (!mongoose.Types.ObjectId.isValid(traineeId)) {
        res.status(400).json({ message: "Invalid trainee ID" });
        return;
      }

      // Load trainee and verify coach relationship
      const trainee = await User.findOne({ _id: traineeId, role: "trainee" });
      if (!trainee) {
        res.status(404).json({ message: "Trainee not found" });
        return;
      }
      if (String(trainee.coachId) !== coachId) {
        res.status(403).json({ message: "This trainee is not assigned to you" });
        return;
      }

      // 409 if a pending draft already exists for this trainee
      const existingDraft = await GeneratedWorkoutPlan.findOne({
        userId: trainee._id,
        status: "draft",
        approvalStatus: "pending_review",
      });
      if (existingDraft) {
        res.status(409).json({
          message: "A plan is already awaiting review for this trainee",
        });
        return;
      }

      const traineeProfile = await TraineeProfile.findOne({ userId: trainee._id });
      if (!traineeProfile) {
        res.status(404).json({ message: "Trainee profile not found" });
        return;
      }

      // Optional coach-provided instructions from request body
      const { notes, focusAreas, excludedExercises } = (req.body ?? {}) as {
        notes?: string;
        focusAreas?: string[];
        excludedExercises?: string[];
      };

      const { likedExercises, dislikedExercises } = await loadGeminiExercisePreferences(trainee._id);

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
        coachNotes: notes,
        focusAreas: Array.isArray(focusAreas) ? focusAreas : undefined,
        excludedExercises: Array.isArray(excludedExercises) ? excludedExercises : undefined,
        likedExercises,
        dislikedExercises,
      };

      const generatedPlan = await generatePersonalizedWorkoutPlan(traineeContext);

      const savedPlan = await GeneratedWorkoutPlan.create({
        userId: trainee._id,
        coachId: new mongoose.Types.ObjectId(coachId),
        title: generatedPlan.title,
        description: generatedPlan.description,
        category: generatedPlan.category,
        difficulty: generatedPlan.difficulty,
        durationWeeks: generatedPlan.durationWeeks,
        workoutDaysPerWeek: generatedPlan.workoutDaysPerWeek,
        equipment: generatedPlan.equipment,
        status: "draft",
        approvalStatus: "pending_review",
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

      await createNotification({
        recipientId: trainee._id,
        type: "plan_generated_by_coach",
        message: "Your coach is preparing a new workout plan for you.",
        planId: savedPlan._id as mongoose.Types.ObjectId,
      });

      res.status(201).json(
        toCoachPlanDTO(
          savedPlan as unknown as IGeneratedWorkoutPlan,
          trainee.firstName,
          trainee.lastName
        )
      );
    } catch (error) {
      if (error instanceof WorkoutGenerationError) {
        res.status(502).json({ message: error.message });
        return;
      }
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: unknown }).code === 11000
      ) {
        res.status(409).json({ message: "A plan is already awaiting review for this trainee" });
        return;
      }
      console.error("Coach generate plan error:", error);
      res.status(500).json({ message: "Failed to generate plan" });
    }
  }
);

// ─── GET /api/coach/change-requests ──────────────────────────────────────────
//   ?status=pending|resolved|rejected|all  (default: pending)

router.get("/change-requests", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.authUser!.userId;
    const statusParam = (req.query.status as string | undefined) ?? "pending";

    const VALID_STATUSES = ["pending", "resolved", "rejected", "all"];
    if (!VALID_STATUSES.includes(statusParam)) {
      res.status(400).json({ message: "Invalid status filter" });
      return;
    }

    const query: Record<string, unknown> = { coachId };
    if (statusParam !== "all") query.status = statusParam;

    const requests = await WorkoutPlanChangeRequest.find(query).sort({ createdAt: -1 });

    if (requests.length === 0) {
      res.json({ requests: [], pendingCount: 0 });
      return;
    }

    const traineeIds = [...new Set(requests.map((r) => String(r.traineeId)))];
    const planIds    = [...new Set(requests.map((r) => String(r.planId)))];

    const [traineeUsers, plans] = await Promise.all([
      User.find({ _id: { $in: traineeIds } }, { firstName: 1, lastName: 1 }),
      GeneratedWorkoutPlan.find({ _id: { $in: planIds } }, { title: 1 }),
    ]);

    const traineeNameMap = new Map(
      traineeUsers.map((u) => [String(u._id), `${u.firstName} ${u.lastName}`])
    );
    const planTitleMap = new Map(
      plans.map((p) => [String(p._id), p.title as string])
    );

    const pendingCount =
      statusParam === "pending"
        ? requests.length
        : requests.filter((r) => r.status === "pending").length;

    res.json({
      requests: requests.map((r) => ({
        id: String(r._id),
        traineeId: String(r.traineeId),
        traineeName: traineeNameMap.get(String(r.traineeId)) ?? "Unknown",
        planId: String(r.planId),
        planTitle: planTitleMap.get(String(r.planId)) ?? "Workout Plan",
        message: r.message,
        status: r.status,
        createdAt: r.createdAt,
        reviewedAt: r.reviewedAt,
      })),
      pendingCount,
    });
  } catch (error) {
    console.error("Get change requests error:", error);
    res.status(500).json({ message: "Failed to get change requests" });
  }
});

// ─── PATCH /api/coach/change-requests/:requestId/reject ──────────────────────

router.patch(
  "/change-requests/:requestId/reject",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coachId   = req.authUser!.userId;
      const requestId = req.params.requestId as string;

      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        res.status(400).json({ message: "Invalid request ID" });
        return;
      }

      const now = new Date();
      const updated = await WorkoutPlanChangeRequest.findOneAndUpdate(
        { _id: requestId, coachId, status: "pending" },
        {
          $set: {
            status: "rejected",
            reviewedAt: now,
            reviewedByCoachId: new mongoose.Types.ObjectId(coachId),
          },
        },
        { new: true }
      );

      if (!updated) {
        const exists = await WorkoutPlanChangeRequest.exists({ _id: requestId, coachId });
        res.status(exists ? 409 : 404).json({
          message: exists
            ? "This request has already been handled."
            : "Change request not found",
        });
        return;
      }

      // Notify trainee (non-blocking)
      const planDoc = await GeneratedWorkoutPlan.findById(updated.planId, { title: 1 });
      await createNotification({
        recipientId: updated.traineeId,
        type: "plan_change_rejected",
        message: `Your coach declined the change request for "${planDoc?.title ?? "your workout plan"}". You can submit a new request if needed.`,
        planId: updated.planId,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Reject change request error:", error);
      res.status(500).json({ message: "Failed to reject change request" });
    }
  }
);

// ─── PATCH /api/coach/change-requests/:requestId/resolve ─────────────────────

router.patch(
  "/change-requests/:requestId/resolve",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coachId   = req.authUser!.userId;
      const requestId = req.params.requestId as string;
      const { planId } = req.body as { planId?: string };

      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        res.status(400).json({ message: "Invalid request ID" });
        return;
      }
      if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
        res.status(400).json({ message: "planId is required" });
        return;
      }

      const now = new Date();
      const updated = await WorkoutPlanChangeRequest.findOneAndUpdate(
        { _id: requestId, coachId, planId, status: "pending" },
        {
          $set: {
            status: "resolved",
            reviewedAt: now,
            reviewedByCoachId: new mongoose.Types.ObjectId(coachId),
          },
        },
        { new: true }
      );

      if (!updated) {
        const existing = await WorkoutPlanChangeRequest.findOne(
          { _id: requestId, coachId },
          { status: 1, planId: 1 }
        );
        if (!existing) {
          res.status(404).json({ message: "Change request not found" });
        } else if (String(existing.planId) !== planId) {
          res.status(400).json({ message: "planId does not match this change request" });
        } else {
          res.status(409).json({ message: "This request has already been handled." });
        }
        return;
      }

      // Notify trainee (non-blocking)
      const planDoc = await GeneratedWorkoutPlan.findById(updated.planId, { title: 1 });
      await createNotification({
        recipientId: updated.traineeId,
        type: "plan_change_resolved",
        message: `Your coach updated "${planDoc?.title ?? "your workout plan"}" based on your change request.`,
        planId: updated.planId,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Resolve change request error:", error);
      res.status(500).json({ message: "Failed to resolve change request" });
    }
  }
);

// ─── GET /api/coach/trainees/:traineeId/change-requests ──────────────────────

router.get(
  "/trainees/:traineeId/change-requests",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coachId = req.authUser!.userId;
      const traineeId = req.params.traineeId as string;

      if (!mongoose.Types.ObjectId.isValid(traineeId)) {
        res.status(400).json({ success: false, message: "Invalid trainee ID" });
        return;
      }

      // Confirm this trainee is connected to this coach
      const trainee = await User.findOne(
        { _id: traineeId, coachId: coachId, role: "trainee" },
        { firstName: 1, lastName: 1 }
      );
      if (!trainee) {
        res.status(404).json({ success: false, message: "Trainee not found" });
        return;
      }

      const requests = await WorkoutPlanChangeRequest.find(
        { traineeId, coachId },
        { message: 1, status: 1, planId: 1, createdAt: 1 }
      ).sort({ createdAt: -1 });

      if (requests.length === 0) {
        res.json({ success: true, changeRequests: [] });
        return;
      }

      // Resolve plan titles in one batch query
      const planIds = [...new Set(requests.map((r) => String(r.planId)))];
      const plans = await GeneratedWorkoutPlan.find(
        { _id: { $in: planIds } },
        { title: 1 }
      );
      const planTitleMap = new Map(
        plans.map((p) => [String(p._id), p.title as string])
      );

      const traineeName = `${trainee.firstName} ${trainee.lastName}`;

      res.json({
        success: true,
        changeRequests: requests.map((r) => ({
          id: String(r._id),
          traineeId: String(r.traineeId),
          traineeName,
          planId: String(r.planId),
          planTitle: planTitleMap.get(String(r.planId)) ?? "Workout Plan",
          message: r.message,
          status: r.status,
          createdAt: r.createdAt,
        })),
      });
    } catch (error) {
      console.error("Failed to get change requests:", error);
      res.status(500).json({ success: false, message: "Failed to get change requests" });
    }
  }
);

export default router;
