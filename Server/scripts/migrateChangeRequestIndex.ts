/**
 * Migration: replace the old compound index on WorkoutPlanChangeRequests
 * with a partial unique index that enforces at most one PENDING request
 * per trainee + plan while allowing unlimited resolved/rejected history.
 *
 * Old index (non-unique): { traineeId: 1, planId: 1, status: 1 }
 * New index (partial unique): { traineeId: 1, planId: 1 }
 *   with partialFilterExpression: { status: "pending" }
 *
 * Usage:
 *   npx ts-node scripts/migrateChangeRequestIndex.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "";
const COLLECTION = "WorkoutPlanChangeRequests";
const OLD_INDEX_NAME = "traineeId_1_planId_1_status_1";
const NEW_INDEX_NAME = "traineeId_planId_pending_unique";

async function run() {
  if (!MONGO_URI) {
    console.error("MONGO_URI not set in environment.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("No database connection.");
    process.exit(1);
  }

  const collection = db.collection(COLLECTION);

  // ── 1. Drop old non-unique index if it exists ─────────────────────────────
  try {
    const existingIndexes = await collection.indexes();
    const oldExists = existingIndexes.some((idx) => idx.name === OLD_INDEX_NAME);

    if (oldExists) {
      await collection.dropIndex(OLD_INDEX_NAME);
      console.log(`Dropped old index: ${OLD_INDEX_NAME}`);
    } else {
      console.log(`Old index "${OLD_INDEX_NAME}" not found — skipping drop.`);
    }
  } catch (err) {
    console.warn(`Could not drop old index: ${(err as Error).message}`);
  }

  // ── 2. Create new partial unique index if not already present ─────────────
  try {
    const existingIndexes = await collection.indexes();
    const newExists = existingIndexes.some((idx) => idx.name === NEW_INDEX_NAME);

    if (!newExists) {
      await collection.createIndex(
        { traineeId: 1, planId: 1 },
        {
          unique: true,
          partialFilterExpression: { status: "pending" },
          name: NEW_INDEX_NAME,
        }
      );
      console.log(`Created new index: ${NEW_INDEX_NAME}`);
    } else {
      console.log(`New index "${NEW_INDEX_NAME}" already exists — skipping.`);
    }
  } catch (err) {
    console.error(`Failed to create new index: ${(err as Error).message}`);
    process.exit(1);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
