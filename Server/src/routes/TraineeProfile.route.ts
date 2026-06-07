import express, { Request, Response } from "express";
import TraineeProfile from "../models/TraineeProfile.model";
import User from "../models/user.model";

const traineeProfileRouter = express.Router();

traineeProfileRouter.post(
  "/:userId/onboarding",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const {
        fitnessLevel,
        goals,
        weeklyWorkouts,
        height,
        weight,
        age,
        medicalConditions,
      } = req.body;

      const profile = await TraineeProfile.findOneAndUpdate(
        { userId },
        {
          userId,
          fitnessLevel,
          goals,
          weeklyWorkouts,
          height,
          weight,
          age,
          medicalConditions,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

      await User.findByIdAndUpdate(userId, {
        hasCompletedOnboarding: true,
      });

      res.status(200).json({
        message: "Onboarding completed successfully",
        profile,
      });
    } catch (error) {
      console.error("Onboarding error:", error);

      res.status(500).json({
        message: "Failed to complete onboarding",
      });
    }
  }
);

export default traineeProfileRouter;