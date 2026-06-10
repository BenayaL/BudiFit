import express, { Response } from "express";
import mongoose from "mongoose";
import TraineeProfile from "../models/TraineeProfile.model";
import User from "../models/user.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";
import { formatUser } from "./users.route";

const traineeProfileRouter = express.Router();

// POST /api/trainee-profiles/me/onboarding
traineeProfileRouter.post(
  "/me/onboarding",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      if (!mongoose.isValidObjectId(userId)) {
        res.status(400).json({ message: "Invalid user ID in authentication token" });
        return;
      }

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (user.role !== "trainee") {
        res.status(403).json({ message: "Only trainees can complete onboarding" });
        return;
      }

      const {
        fitnessLevel,
        goals,
        weeklyWorkouts,
        height,
        weight,
        age,
        medicalConditions,
      } = req.body;

      if (!fitnessLevel || weeklyWorkouts === undefined || weeklyWorkouts === null) {
        res.status(400).json({
          message: "fitnessLevel and weeklyWorkouts are required",
        });
        return;
      }

      const validFitnessLevels = ["beginner", "intermediate", "advanced"];
      if (!validFitnessLevels.includes(fitnessLevel)) {
        res.status(400).json({
          message: "fitnessLevel must be beginner, intermediate, or advanced",
        });
        return;
      }

      if (typeof weeklyWorkouts !== "number" || weeklyWorkouts < 1 || weeklyWorkouts > 7) {
        res.status(400).json({ message: "weeklyWorkouts must be a number between 1 and 7" });
        return;
      }

      const setFields: Record<string, unknown> = {
        fitnessLevel,
        goals: Array.isArray(goals) ? goals : [],
        weeklyWorkouts,
        medicalConditions: Array.isArray(medicalConditions) ? medicalConditions : [],
      };

      if (height !== undefined) setFields.height = height;
      if (weight !== undefined) setFields.weight = weight;
      if (age !== undefined) setFields.age = age;

      const profile = await TraineeProfile.findOneAndUpdate(
        { userId },
        {
          $set: setFields,
          $setOnInsert: { userId },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            hasCompletedOnboarding: true,
            fitnessLevel,
            goals: Array.isArray(goals) ? goals : [],
          },
        },
        { new: true, projection: { password: 0 } }
      );

      if (!updatedUser) {
        res.status(404).json({ message: "User not found after update" });
        return;
      }

      res.status(200).json({
        message: "Onboarding completed successfully",
        profile,
        user: formatUser(updatedUser),
      });
    } catch (error) {
      console.error("Onboarding error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown onboarding error";

      res.status(500).json({
        message: "Failed to complete onboarding",
        error: errorMessage,
      });
    }
  }
);

export default traineeProfileRouter;
