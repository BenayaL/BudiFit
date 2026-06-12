// Routes matching ENDPOINTS.coach in the client:
//   GET  /api/coach/dashboard
//   GET  /api/coach/trainees
//   GET  /api/coach/trainees/:traineeId
//   GET  /api/coach/plans
//   GET  /api/coach/plans/:planId
//   POST /api/coach/plans/:planId/approve
//   POST /api/coach/plans/:planId/reject

import { Router, Response, NextFunction } from "express";
import User from "../models/user.model";
import type { IUser } from "../models/user.model";
import Plan from "../models/plan.model";
import type { IPlan } from "../models/plan.model";
import TraineeProfile from "../models/TraineeProfile.model";
import type { ITraineeProfile } from "../models/TraineeProfile.model";
import Workout from "../models/workout.model";
import type { IWorkout } from "../models/workout.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

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

interface PlanExerciseDTO {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  durationSec?: number;
  equipment: string;
  difficulty: "easy" | "moderate" | "hard";
}

interface CoachPlanDTO {
  id: string;
  traineeId: string;
  traineeName: string;
  title: string;
  status: "pending_approval" | "approved" | "rejected";
  exercises: PlanExerciseDTO[];
}

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

// ─── Streak helper (same algorithm as progress.routes.ts) ─────────────────────

const DAY_MS = 86_400_000;

function calcStreak(completedWorkouts: Array<{ scheduledAt: Date }>): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutDays = new Set(
    completedWorkouts.map((w) => {
      const d = new Date(w.scheduledAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let streak = 0;
  let cursor = today.getTime();
  while (workoutDays.has(cursor)) {
    streak++;
    cursor -= DAY_MS;
  }
  return streak;
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

function toTraineeDTO(
  user: IUser,
  profile: ITraineeProfile | undefined,
  workouts: IWorkout[]
): TraineeDTO {
  const userId = user._id.toString();
  const now = new Date();

  const completedWorkouts = workouts.filter((w) => w.status === "completed");
  const completedChallenges = completedWorkouts.length;
  const missedWorkouts = workouts.filter(
    (w) => w.scheduledAt < now && w.status !== "completed"
  ).length;

  // Weekly activity: Sun–Sat of the current week, one slot per day.
  // Each value is the count of completed workouts on that day.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const sunday = new Date(todayStart.getTime() - todayStart.getDay() * DAY_MS);
  const weeklyActivity: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (const w of completedWorkouts) {
    const d = new Date(w.scheduledAt);
    d.setHours(0, 0, 0, 0);
    const idx = Math.round((d.getTime() - sunday.getTime()) / DAY_MS);
    if (idx >= 0 && idx < 7) weeklyActivity[idx]++;
  }

  const streakDays = calcStreak(completedWorkouts);

  // Status rule:
  // - inactive:        no workout records at all
  // - needs_attention: has one or more missed workouts
  // - active:          completed >= 1 this week and no missed workouts
  // - otherwise:       inactive
  let status: "active" | "needs_attention" | "inactive";
  if (workouts.length === 0) {
    status = "inactive";
  } else if (missedWorkouts > 0) {
    status = "needs_attention";
  } else if (weeklyActivity.some((v) => v > 0)) {
    status = "active";
  } else {
    status = "inactive";
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

function toPlanDTO(plan: IPlan): CoachPlanDTO {
  return {
    id: plan._id.toString(),
    traineeId: plan.traineeId.toString(),
    traineeName: plan.traineeName,
    title: plan.title,
    status: plan.status,
    exercises: plan.exercises.map((ex) => ({
      id: ex._id?.toString() ?? "",
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      durationSec: ex.durationSec,
      equipment: ex.equipment,
      difficulty: ex.difficulty,
    })),
  };
}

// ─── Batch trainee data loader ────────────────────────────────────────────────
// Loads all trainees for a coach, their profiles, and their workouts in 3 queries.

async function loadTraineeDTOs(coachId: string): Promise<TraineeDTO[]> {
  const traineeUsers = await User.find(
    { coachId, role: "trainee" },
    { password: 0 }
  );

  if (traineeUsers.length === 0) return [];

  const traineeIds = traineeUsers.map((t) => t._id);

  const [profiles, workouts] = await Promise.all([
    TraineeProfile.find({ userId: { $in: traineeIds } }),
    Workout.find({ userId: { $in: traineeIds } }),
  ]);

  const profileMap = new Map<string, ITraineeProfile>(
    profiles.map((p) => [p.userId.toString(), p as unknown as ITraineeProfile])
  );
  const workoutMap = new Map<string, IWorkout[]>();
  for (const w of workouts) {
    const uid = w.userId.toString();
    const arr = workoutMap.get(uid) ?? [];
    arr.push(w as unknown as IWorkout);
    workoutMap.set(uid, arr);
  }

  return traineeUsers.map((user) =>
    toTraineeDTO(
      user as unknown as IUser,
      profileMap.get(user._id.toString()),
      workoutMap.get(user._id.toString()) ?? []
    )
  );
}

// ─── GET /api/coach/dashboard ─────────────────────────────────────────────────

router.get("/dashboard", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coachId = req.authUser!.userId;

    const coach = await User.findById(coachId, { password: 0 });
    if (!coach) {
      res.status(404).json({ message: "Coach not found" });
      return;
    }

    const [trainees, rawPlans] = await Promise.all([
      loadTraineeDTOs(coachId),
      Plan.find({ coachId, status: "pending_approval" }),
    ]);

    res.status(200).json({
      coach: toCoachDTO(coach as unknown as IUser, trainees.map((t) => t.userId)),
      trainees,
      pendingPlans: rawPlans.map(toPlanDTO),
    });
  } catch (error) {
    console.error("Coach dashboard error:", error);
    res.status(500).json({ message: "Failed to get dashboard" });
  }
});

// ─── GET /api/coach/trainees ──────────────────────────────────────────────────

router.get("/trainees", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const trainees = await loadTraineeDTOs(req.authUser!.userId);
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
      // Verify the trainee belongs to this coach
      const traineeUser = await User.findOne(
        {
          _id: req.params.traineeId,
          role: "trainee",
          coachId: req.authUser!.userId,
        },
        { password: 0 }
      );
      if (!traineeUser) {
        res.status(404).json({ message: "Trainee not found" });
        return;
      }

      const [profile, workouts, rawPlans] = await Promise.all([
        TraineeProfile.findOne({ userId: req.params.traineeId }),
        Workout.find({ userId: req.params.traineeId }),
        Plan.find({ traineeId: req.params.traineeId }),
      ]);

      res.status(200).json({
        trainee: toTraineeDTO(
          traineeUser as unknown as IUser,
          profile ? (profile as unknown as ITraineeProfile) : undefined,
          workouts as unknown as IWorkout[]
        ),
        plans: rawPlans.map(toPlanDTO),
      });
    } catch (error) {
      console.error("Get trainee details error:", error);
      res.status(500).json({ message: "Failed to get trainee details" });
    }
  }
);

// ─── GET /api/coach/plans ─────────────────────────────────────────────────────

router.get("/plans", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await Plan.find({ coachId: req.authUser!.userId });
    res.status(200).json(plans.map(toPlanDTO));
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
      const plan = await Plan.findOne({
        _id: req.params.planId,
        coachId: req.authUser!.userId,
      });
      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }

      res.status(200).json(toPlanDTO(plan));
    } catch (error) {
      console.error("Get plan error:", error);
      res.status(500).json({ message: "Failed to get plan" });
    }
  }
);

// ─── POST /api/coach/plans/:planId/approve ────────────────────────────────────

router.post(
  "/plans/:planId/approve",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const plan = await Plan.findOneAndUpdate(
        { _id: req.params.planId, coachId: req.authUser!.userId },
        { status: "approved" },
        { new: true }
      );
      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }

      res.status(200).json(toPlanDTO(plan));
    } catch (error) {
      console.error("Approve plan error:", error);
      res.status(500).json({ message: "Failed to approve plan" });
    }
  }
);

// ─── POST /api/coach/plans/:planId/reject ─────────────────────────────────────

router.post(
  "/plans/:planId/reject",
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const plan = await Plan.findOneAndUpdate(
        { _id: req.params.planId, coachId: req.authUser!.userId },
        { status: "rejected" },
        { new: true }
      );
      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }

      res.status(200).json(toPlanDTO(plan));
    } catch (error) {
      console.error("Reject plan error:", error);
      res.status(500).json({ message: "Failed to reject plan" });
    }
  }
);

export default router;
