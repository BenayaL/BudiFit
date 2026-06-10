import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPlanExercise {
  name: string;
  sets: number;
  reps?: number;
  durationSec?: number;
  equipment: string;
  difficulty: "easy" | "moderate" | "hard";
}

export interface IPlan extends Document {
  traineeId: Types.ObjectId;
  traineeName: string;
  coachId: Types.ObjectId;
  title: string;
  status: "pending_approval" | "approved" | "rejected";
  exercises: IPlanExercise[];
}

const PlanExerciseSchema = new Schema<IPlanExercise>(
  {
    name:        { type: String, required: true, trim: true },
    sets:        { type: Number, required: true, min: 1 },
    reps:        { type: Number },
    durationSec: { type: Number },
    equipment:   { type: String, default: "none", trim: true },
    difficulty:  { type: String, enum: ["easy", "moderate", "hard"], required: true },
  },
  { _id: true }
);

const PlanSchema = new Schema<IPlan>(
  {
    traineeId:   { type: Schema.Types.ObjectId, ref: "Users", required: true },
    traineeName: { type: String, required: true, trim: true },
    coachId:     { type: Schema.Types.ObjectId, ref: "Users", required: true },
    title:       { type: String, required: true, trim: true },

    status: {
      type: String,
      enum: ["pending_approval", "approved", "rejected"],
      default: "pending_approval",
    },

    exercises: { type: [PlanExerciseSchema], default: [] },
  },
  {
    collection: "Plans",
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.model<IPlan>("Plans", PlanSchema);