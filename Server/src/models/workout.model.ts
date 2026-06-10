import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWorkoutExercise {
  name: string;
  sets: number;
  reps?: number;
  durationSec?: number;
  equipment: string;
}

export interface IWorkout extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
  durationMinutes: number;
  scheduledAt: Date;
  exercises: IWorkoutExercise[];
}

const WorkoutExerciseSchema = new Schema<IWorkoutExercise>(
  {
    name:        { type: String, required: true, trim: true },
    sets:        { type: Number, required: true, min: 1 },
    reps:        { type: Number },
    durationSec: { type: Number },
    equipment:   { type: String, default: "none", trim: true },
  },
  { _id: true }
);

const WorkoutSchema = new Schema<IWorkout>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },

    durationMinutes: { type: Number, default: 0, min: 0 },
    scheduledAt:     { type: Date, required: true },
    exercises:       { type: [WorkoutExerciseSchema], default: [] },
  },
  {
    collection: "Workouts",
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.model<IWorkout>("Workouts", WorkoutSchema);