import express, { Response } from "express";
import mongoose from "mongoose";

import TraineeProfile from "../models/TraineeProfile.model";
import User from "../models/user.model";

import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  traineeOnboardingSchema,
  type TraineeOnboardingInput,
} from "../validation/traineeProfile.validation";

import { formatUser } from "./users.route";

const traineeProfileRouter = express.Router();

/**
 * POST /api/trainee-profiles/me/onboarding
 *
 * Completes or updates the onboarding profile of the
 * currently authenticated trainee.
 *
 * The user ID is read only from the verified JWT.
 */
traineeProfileRouter.post(
  "/me/onboarding",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.authUser?.userId;

      /*
       * The authentication middleware should always provide this
       * value after successfully validating the JWT.
       */
      if (!userId) {
        res.status(401).json({
          message: "Authenticated user was not found",
        });
        return;
      }

      /*
       * Prevent an invalid ID from reaching a MongoDB query.
       */
      if (!mongoose.isValidObjectId(userId)) {
        res.status(400).json({
          message:
            "Invalid user ID in authentication token",
        });
        return;
      }

      /*
       * Load the real authenticated user from MongoDB.
       */
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      /*
       * Coaches must not complete trainee onboarding.
       */
      if (user.role !== "trainee") {
        res.status(403).json({
          message:
            "Only trainees can complete onboarding",
        });
        return;
      }

      /*
       * Validate the complete request body before writing
       * anything to MongoDB.
       */
      const validationResult =
        traineeOnboardingSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          message: "Invalid onboarding data",

          errors: validationResult.error.issues.map(
            (issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })
          ),
        });

        return;
      }

      const onboardingData = validationResult.data;

      /*
       * Required profile fields.
       *
       * Partial is used because the optional onboarding fields
       * are added only when the Client actually supplied them.
       */
      const setFields: Partial<TraineeOnboardingInput> = {
        age: onboardingData.age,
        fitnessLevel:
          onboardingData.fitnessLevel,
        goals: onboardingData.goals,
        availableEquipment:
          onboardingData.availableEquipment,
        weeklyWorkouts:
          onboardingData.weeklyWorkouts,
        preferredWorkoutTime:
          onboardingData.preferredWorkoutTime,
        sessionDurationMinutes:
          onboardingData.sessionDurationMinutes,
      };

      /*
       * Do not store undefined optional values.
       *
       * This also prevents an omitted value from overwriting
       * information that already exists in an older profile.
       */
      if (onboardingData.gender !== undefined) {
        setFields.gender = onboardingData.gender;
      }

      if (onboardingData.height !== undefined) {
        setFields.height = onboardingData.height;
      }

      if (onboardingData.weight !== undefined) {
        setFields.weight = onboardingData.weight;
      }

      if (
        onboardingData.medicalConditions !==
        undefined
      ) {
        setFields.medicalConditions =
          onboardingData.medicalConditions;
      }

      if (
        onboardingData.medicalNotes !== undefined
      ) {
        setFields.medicalNotes =
          onboardingData.medicalNotes;
      }

      const userObjectId =
        new mongoose.Types.ObjectId(userId);

      /*
       * Upsert means:
       *
       * - Create the profile when it does not exist.
       * - Update the existing profile when it already exists.
       *
       * We use update operators instead of passing a replacement
       * document. This avoids the previous replacement-document
       * and ObjectId casting problems.
       */
      const profile =
        await TraineeProfile.findOneAndUpdate(
          {
            userId: userObjectId,
          },
          {
            $set: setFields,

            $setOnInsert: {
              userId: userObjectId,
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );

      if (!profile) {
        res.status(500).json({
          message:
            "Failed to save trainee profile",
        });
        return;
      }

      /*
       * Keep only the summary fields needed globally inside
       * the Users collection.
       *
       * The complete trainee information remains inside
       * TraineeProfiles.
       */
      user.fitnessLevel =
        onboardingData.fitnessLevel;

      user.goals = [...onboardingData.goals];

      /*
       * This flag is changed only after the trainee profile
       * was successfully persisted.
       */
      user.hasCompletedOnboarding = true;

      await user.save();

      /*
       * Return both persisted documents.
       *
       * formatUser removes the password and returns the DTO
       * already expected by the Client and AuthContext.
       */
      res.status(200).json({
        message:
          "Onboarding completed successfully",

        profile,

        user: formatUser(user),
      });
    } catch (error) {
      console.error("Onboarding error:", error);

      /*
       * Zod validates the request first, but the Mongoose
       * validation remains an additional database-level
       * protection.
       */
      if (
        error instanceof
        mongoose.Error.ValidationError
      ) {
        res.status(400).json({
          message:
            "Invalid trainee profile data",

          errors: Object.values(
            error.errors
          ).map(
            (validationError) =>
              validationError.message
          ),
        });

        return;
      }

      /*
       * Do not expose stack traces or internal database
       * information to the Client.
       */
      res.status(500).json({
        message:
          "Failed to complete onboarding",
      });
    }
  }
);

export default traineeProfileRouter;