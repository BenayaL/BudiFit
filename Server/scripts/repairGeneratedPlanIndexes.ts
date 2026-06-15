/**
 * Repair script: drop the incorrect pending-review unique index and create the
 * corrected one that excludes archived plans.
 *
 * The old index used { userId, approvalStatus } with partialFilter { approvalStatus: "pending_review" }
 * which matched archived plans. The new index uses { userId } with partialFilter
 * { status: "draft", approvalStatus: "pending_review" } so archived plans are excluded.
 *
 * Run once:
 *   npx ts-node --project tsconfig.json scripts/repairGeneratedPlanIndexes.ts
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
  console.log("[INDEX REPAIR] Connected to MongoDB");

  const collection = GeneratedWorkoutPlan.collection;

  const indexes = await collection.indexes();
  console.log(
    "[INDEX REPAIR] Existing indexes:",
    indexes.map((i) => i.name)
  );

  // Drop old incorrect index if it exists (may have either of these names)
  const oldNames = ["userId_1_approvalStatus_1", "approvalStatus_pending_review"];
  for (const name of oldNames) {
    if (indexes.some((i) => i.name === name)) {
      await collection.dropIndex(name);
      console.log(`[INDEX REPAIR] Dropped old index: ${name}`);
    }
  }

  // Also drop by key pattern in case the name differs
  for (const idx of indexes) {
    const keys = Object.keys(idx.key ?? {});
    if (
      idx.unique &&
      keys.includes("userId") &&
      keys.includes("approvalStatus") &&
      idx.name !== "one_pending_review_draft_per_user"
    ) {
      await collection.dropIndex(idx.name!);
      console.log(`[INDEX REPAIR] Dropped old index by key pattern: ${idx.name}`);
    }
  }

  // Create the corrected index
  await collection.createIndex(
    { userId: 1 },
    {
      unique: true,
      partialFilterExpression: { status: "draft", approvalStatus: "pending_review" },
      name: "one_pending_review_draft_per_user",
    }
  );
  console.log("[INDEX REPAIR] Created corrected index: one_pending_review_draft_per_user");

  await mongoose.connection.close();
  console.log("[INDEX REPAIR] Done");
}

run().catch((err) => {
  console.error("[INDEX REPAIR] Error:", err);
  process.exit(1);
});
