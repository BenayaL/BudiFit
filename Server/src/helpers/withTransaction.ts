import mongoose from "mongoose";

function isNotReplicaSetError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const msg = (error as { message?: string }).message ?? "";
  return msg.includes("Transaction numbers are only allowed on a replica set");
}

/**
 * Runs `fn` inside a MongoDB session+transaction.
 * Falls back to running `fn(null)` without a session when the server
 * is a standalone mongod that does not support multi-document transactions.
 */
export async function withMongoTransaction<T>(
  fn: (session: mongoose.ClientSession | null) => Promise<T>
): Promise<T> {
  let session: mongoose.ClientSession | null = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error: unknown) {
    if (session) {
      try { await session.abortTransaction(); } catch { /* ignore */ }
    }
    if (isNotReplicaSetError(error)) {
      return fn(null);
    }
    throw error;
  } finally {
    if (session) {
      try { await session.endSession(); } catch { /* ignore */ }
    }
  }
}
