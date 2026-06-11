/**
 * Migration: reset hasCompletedOnboarding for trainees with incomplete profiles
 *
 * Run once after deploying the new onboarding flow:
 *   cd Server
 *   npx ts-node scripts/migrate-incomplete-onboarding.ts
 *
 * What it does:
 *   1. Finds all trainee Users where hasCompletedOnboarding = true.
 *   2. Checks whether their TraineeProfile contains all required new fields:
 *      age, fitnessLevel, goals (≥1), availableEquipment (≥1),
 *      weeklyWorkouts, preferredWorkoutTime, sessionDurationMinutes.
 *   3. If the profile is missing any required field, sets the User's
 *      hasCompletedOnboarding to false so the trainee will be routed
 *      back through the new 8-step onboarding flow.
 *
 * What it does NOT do:
 *   - Does not delete any existing profile data.
 *   - Does not invent or backfill missing values.
 *   - Does not run automatically at server startup.
 *
 * Safe to re-run: checks each user individually before updating.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/user.model";
import TraineeProfile from "../src/models/TraineeProfile.model";

dotenv.config();

function isProfileComplete(profile: InstanceType<typeof TraineeProfile> | null): boolean {
  if (!profile) return false;

  if (!profile.age || !Number.isInteger(profile.age)) return false;
  if (!profile.fitnessLevel) return false;
  if (!Array.isArray(profile.goals) || profile.goals.length < 1) return false;
  if (!Array.isArray(profile.availableEquipment) || profile.availableEquipment.length < 1) return false;
  if (!Number.isInteger(profile.weeklyWorkouts) || profile.weeklyWorkouts < 1) return false;
  if (!profile.preferredWorkoutTime) return false;
  if (!profile.sessionDurationMinutes) return false;

  return true;
}

async function run(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MONGO_URI is missing from the .env file");
    process.exit(1);
  }

  console.log("Connecting to MongoDB…");
  await mongoose.connect(mongoUri);
  console.log("Connected to:", mongoose.connection.name);

  const completedTrainees = await User.find({
    role: "trainee",
    hasCompletedOnboarding: true,
  });

  console.log(`Found ${completedTrainees.length} trainee(s) with hasCompletedOnboarding = true`);

  let resetCount = 0;
  let alreadyCompleteCount = 0;

  for (const user of completedTrainees) {
    const profile = await TraineeProfile.findOne({ userId: user._id });
    const complete = isProfileComplete(profile);

    if (!complete) {
      console.log(`  Resetting ${user.email} — profile is missing required fields`);
      user.hasCompletedOnboarding = false;
      await user.save();
      resetCount++;
    } else {
      alreadyCompleteCount++;
    }
  }

  console.log("\nMigration complete:");
  console.log(`  ${resetCount} user(s) reset to hasCompletedOnboarding = false`);
  console.log(`  ${alreadyCompleteCount} user(s) already have a complete profile — unchanged`);

  await mongoose.connection.close();
  console.log("MongoDB connection closed");
}

void run().catch((err: unknown) => {
  console.error("Migration failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
