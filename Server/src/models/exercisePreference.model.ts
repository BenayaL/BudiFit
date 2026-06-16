import mongoose, { Document, Schema, Types } from "mongoose";

export type ExercisePreferenceValue = "liked" | "disliked";

export type ExercisePreferenceReason =
  | "too_hard"
  | "too_easy"
  | "discomfort"
  | "unavailable_equipment"
  | "not_enjoyable"
  | "too_complex"
  | "other";

export interface IExercisePreference extends Document {
  userId: Types.ObjectId;
  exerciseKey: string;
  exerciseName: string;
  preference: ExercisePreferenceValue;
  reason?: ExercisePreferenceReason;
  createdAt: Date;
  updatedAt: Date;
}

/*
 * Identity for an exercise preference is the normalized name, not a plan's
 * exercise subdocument ID — every newly generated plan creates new
 * exercise IDs for what is conceptually the same exercise.
 */
export function normalizeExerciseKey(exerciseName: string): string {
  return exerciseName.trim().toLowerCase().replace(/\s+/g, " ");
}

const ExercisePreferenceSchema = new Schema<IExercisePreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    exerciseKey: {
      type: String,
      required: true,
    },
    exerciseName: {
      type: String,
      required: true,
      trim: true,
    },
    preference: {
      type: String,
      enum: ["liked", "disliked"],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "too_hard",
        "too_easy",
        "discomfort",
        "unavailable_equipment",
        "not_enjoyable",
        "too_complex",
        "other",
      ],
    },
  },
  {
    collection: "ExercisePreferences",
    versionKey: false,
    timestamps: true,
  }
);

ExercisePreferenceSchema.index(
  { userId: 1, exerciseKey: 1 },
  { unique: true }
);

const ExercisePreference =
  mongoose.models.ExercisePreferences ||
  mongoose.model<IExercisePreference>(
    "ExercisePreferences",
    ExercisePreferenceSchema
  );

export default ExercisePreference;
