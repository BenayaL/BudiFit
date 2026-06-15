import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDailyWorkoutLog extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  workoutDate: string; // "YYYY-MM-DD"
  dayNumber: number;
  status: "completed";
  completedAt: Date;
  planTitle: string;
  dayTitle: string;
  exerciseSummary: string;
  durationMinutes: number;
  restDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DailyWorkoutLogSchema = new Schema<IDailyWorkoutLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "GeneratedWorkoutPlans",
      required: true,
    },
    workoutDate: { type: String, required: true },
    dayNumber: { type: Number, required: true, min: 1, max: 7 },
    status: { type: String, enum: ["completed"], default: "completed" },
    completedAt: { type: Date, required: true },
    planTitle: { type: String, required: true, trim: true },
    dayTitle: { type: String, required: true, trim: true },
    exerciseSummary: { type: String, default: "" },
    durationMinutes: { type: Number, default: 0, min: 0 },
    restDay: { type: Boolean, default: false },
  },
  {
    collection: "DailyWorkoutLogs",
    timestamps: true,
  }
);

DailyWorkoutLogSchema.index(
  { userId: 1, planId: 1, workoutDate: 1 },
  { unique: true }
);

const DailyWorkoutLog =
  mongoose.models.DailyWorkoutLogs ||
  mongoose.model<IDailyWorkoutLog>("DailyWorkoutLogs", DailyWorkoutLogSchema);

export default DailyWorkoutLog;
