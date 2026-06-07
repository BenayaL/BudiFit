import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITraineeProfile extends Document {
  userId: Types.ObjectId;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  weeklyWorkouts: number;
  height?: number;
  weight?: number;
  age?: number;
  medicalConditions: string[];
}

const TraineeProfileSchema = new Schema<ITraineeProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
    },

    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },

    goals: {
      type: [String],
      default: [],
    },

    weeklyWorkouts: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },

    height: {
      type: Number,
    },

    weight: {
      type: Number,
    },

    age: {
      type: Number,
    },

    medicalConditions: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "TraineeProfiles",
    versionKey: false,
    timestamps: true,
  }
);

export default mongoose.model<ITraineeProfile>(
  "TraineeProfiles",
  TraineeProfileSchema
);