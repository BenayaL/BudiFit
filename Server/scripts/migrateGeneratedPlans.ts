/**
 * Migration: set approvalStatus/lastModifiedBy/version defaults on existing GeneratedWorkoutPlan
 * documents that pre-date the coach-review feature.
 *
 * Run once:
 *   npx ts-node --project tsconfig.json scripts/migrateGeneratedPlans.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI missing from .env");
  process.exit(1);
}

async function run(): Promise<void> {
  await mongoose.connect(MONGO_URI!);
  console.log("[MIGRATE] Connected to MongoDB");

  const collection = mongoose.connection.collection("GeneratedWorkoutPlans");

  // Set defaults on documents missing the new fields
  const result = await collection.updateMany(
    {
      $or: [
        { approvalStatus: { $exists: false } },
        { lastModifiedBy: { $exists: false } },
        { version: { $exists: false } },
      ],
    },
    {
      $set: {
        approvalStatus: "not_required",
        lastModifiedBy: "gemini",
        version: 1,
      },
    }
  );

  console.log(`[MIGRATE] Updated ${result.modifiedCount} documents`);

  await mongoose.connection.close();
  console.log("[MIGRATE] Done");
}

run().catch((err) => {
  console.error("[MIGRATE] Error:", err);
  process.exit(1);
});
