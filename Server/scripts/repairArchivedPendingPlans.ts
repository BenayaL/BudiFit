/**
 * Repair script: fix documents where status="archived" but approvalStatus="pending_review".
 * These were created before the coach-delete endpoint set archivedAt, or before the
 * pending-check query was fixed. They should be harmless after the index fix, but
 * correcting the data removes confusion.
 *
 * Safe to run multiple times (idempotent).
 *
 * Run once:
 *   npx ts-node --project tsconfig.json scripts/repairArchivedPendingPlans.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import GeneratedWorkoutPlan from "../src/models/generatedWorkoutPlan.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI missing from .env");
  process.exit(1);
}

async function run(): Promise<void> {
  await mongoose.connect(MONGO_URI!);
  console.log("[DATA REPAIR] Connected to MongoDB");

  const collection = GeneratedWorkoutPlan.collection;

  // Fix archived plans that still have approvalStatus=pending_review
  const pendingArchived = await collection.updateMany(
    { status: "archived", approvalStatus: "pending_review" },
    {
      $set: { approvalStatus: "approved" },
      // Also ensure archivedAt is set
      $setOnInsert: {},
    }
  );

  if (pendingArchived.modifiedCount > 0) {
    console.log(
      `[DATA REPAIR] Fixed ${pendingArchived.modifiedCount} archived plans with stale pending_review status`
    );
  } else {
    console.log("[DATA REPAIR] No stale archived pending_review plans found");
  }

  // Ensure all archived plans have archivedAt set
  const missingArchivedAt = await collection.updateMany(
    { status: "archived", archivedAt: { $exists: false } },
    { $set: { archivedAt: new Date() } }
  );

  if (missingArchivedAt.modifiedCount > 0) {
    console.log(
      `[DATA REPAIR] Set archivedAt on ${missingArchivedAt.modifiedCount} archived plans missing the field`
    );
  } else {
    console.log("[DATA REPAIR] All archived plans already have archivedAt");
  }

  await mongoose.connection.close();
  console.log("[DATA REPAIR] Done");
}

run().catch((err) => {
  console.error("[DATA REPAIR] Error:", err);
  process.exit(1);
});
