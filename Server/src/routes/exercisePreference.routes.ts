import { Router, Response } from "express";
import { z } from "zod";
import ExercisePreference, {
  normalizeExerciseKey,
} from "../models/exercisePreference.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

const router = Router();
router.use(authenticateToken);

function toPreferenceDTO(pref: {
  _id: unknown;
  exerciseKey: string;
  exerciseName: string;
  preference: string;
  reason?: string;
}) {
  return {
    id: String(pref._id),
    exerciseKey: pref.exerciseKey,
    exerciseName: pref.exerciseName,
    preference: pref.preference,
    reason: pref.reason,
  };
}

// ─── GET /api/exercise-preferences ────────────────────────────────────────────

router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const preferences = await ExercisePreference.find({
      userId: req.authUser!.userId,
    });
    res.status(200).json(preferences.map(toPreferenceDTO));
  } catch (error) {
    console.error("Get exercise preferences error:", error);
    res.status(500).json({ message: "Failed to get exercise preferences" });
  }
});

// ─── PUT /api/exercise-preferences ────────────────────────────────────────────

const putBodySchema = z
  .object({
    exerciseName: z.string().trim().min(1).max(120),
    preference: z.enum(["liked", "disliked"]).nullable(),
    reason: z
      .enum([
        "too_hard",
        "too_easy",
        "discomfort",
        "unavailable_equipment",
        "not_enjoyable",
        "too_complex",
        "other",
      ])
      .optional(),
  })
  .superRefine((body, ctx) => {
    if (body.reason !== undefined && body.preference !== "disliked") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "reason is only valid when preference is \"disliked\"",
      });
    }
  });

router.put("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUser!.userId;
    const parsed = putBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Invalid request body",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { exerciseName, preference, reason } = parsed.data;
    const exerciseKey = normalizeExerciseKey(exerciseName);

    if (preference === null) {
      await ExercisePreference.deleteOne({ userId, exerciseKey });
      res.status(200).json({ removed: true });
      return;
    }

    const setFields: Record<string, unknown> = { exerciseName, preference };
    const unsetFields: Record<string, 1> = {};
    if (preference === "disliked" && reason !== undefined) {
      setFields.reason = reason;
    } else {
      unsetFields.reason = 1;
    }

    const update: Record<string, unknown> = { $set: setFields };
    if (Object.keys(unsetFields).length > 0) update.$unset = unsetFields;

    const updated = await ExercisePreference.findOneAndUpdate(
      { userId, exerciseKey },
      update,
      { upsert: true, new: true }
    );

    res.status(200).json(toPreferenceDTO(updated));
  } catch (error) {
    console.error("Update exercise preference error:", error);
    res.status(500).json({ message: "Failed to update exercise preference" });
  }
});

export default router;
