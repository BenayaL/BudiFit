import mongoose, { Document, Schema, Types } from "mongoose";

export type WorkoutPlanChangeRequestStatus = "pending" | "resolved" | "rejected";

export interface IWorkoutPlanChangeRequest extends Document {
  traineeId: Types.ObjectId;
  coachId: Types.ObjectId;
  planId: Types.ObjectId;
  message: string;
  status: WorkoutPlanChangeRequestStatus;
  reviewedAt?: Date;
  reviewedByCoachId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutPlanChangeRequestSchema = new Schema<IWorkoutPlanChangeRequest>(
  {
    traineeId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "GeneratedWorkoutPlans",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending",
    },
    reviewedAt: {
      type: Date,
    },
    reviewedByCoachId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    collection: "WorkoutPlanChangeRequests",
    versionKey: false,
    timestamps: true,
  }
);

// Partial unique index: only one PENDING request per trainee+plan allowed.
// Resolved/rejected historical requests are not constrained — multiple may exist.
// Run scripts/migrateChangeRequestIndex.ts to drop the old non-partial index.
WorkoutPlanChangeRequestSchema.index(
  { traineeId: 1, planId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
    name: "traineeId_planId_pending_unique",
  }
);
WorkoutPlanChangeRequestSchema.index({ coachId: 1, status: 1, createdAt: -1 });

const WorkoutPlanChangeRequest =
  mongoose.models.WorkoutPlanChangeRequests ||
  mongoose.model<IWorkoutPlanChangeRequest>(
    "WorkoutPlanChangeRequests",
    WorkoutPlanChangeRequestSchema
  );

export default WorkoutPlanChangeRequest;
