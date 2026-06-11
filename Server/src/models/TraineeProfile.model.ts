import mongoose, { Document, Schema, Types } from "mongoose";

import {
  EQUIPMENT_OPTIONS,
  FITNESS_LEVELS,
  GENDERS,
  GOALS,
  MEDICAL_CONDITIONS,
  PREFERRED_WORKOUT_TIMES,
  SESSION_DURATION_OPTIONS,
  type Equipment,
  type FitnessLevel,
  type Gender,
  type Goal,
  type MedicalCondition,
  type PreferredWorkoutTime,
  type SessionDurationMinutes,
} from "./TraineeProfile.types";

export interface ITraineeProfile extends Document {
  userId: Types.ObjectId;

  age: number;
  gender?: Gender;

  height?: number;
  weight?: number;

  fitnessLevel: FitnessLevel;
  goals: Goal[];

  availableEquipment: Equipment[];

  medicalConditions: MedicalCondition[];
  medicalNotes?: string;

  weeklyWorkouts: number;
  preferredWorkoutTime: PreferredWorkoutTime;
  sessionDurationMinutes: SessionDurationMinutes;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Checks that an array contains no duplicate values.
 */
const hasUniqueValues = <T>(values: T[]): boolean => {
  return new Set(values).size === values.length;
};

const TraineeProfileSchema = new Schema<ITraineeProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      unique: true,
    },

    age: {
      type: Number,
      required: true,
      min: [10, "Age must be at least 10"],
      max: [99, "Age must be at most 99"],
      validate: {
        validator: Number.isInteger,
        message: "Age must be an integer",
      },
    },

    gender: {
      type: String,
      enum: {
        values: [...GENDERS],
        message: "Invalid gender value",
      },
      required: false,
    },

    height: {
      type: Number,
      min: [100, "Height must be at least 100 cm"],
      max: [250, "Height must be at most 250 cm"],
      required: false,
    },

    weight: {
      type: Number,
      min: [30, "Weight must be at least 30 kg"],
      max: [300, "Weight must be at most 300 kg"],
      required: false,
    },

    fitnessLevel: {
      type: String,
      enum: {
        values: [...FITNESS_LEVELS],
        message: "Invalid fitness level",
      },
      required: true,
    },

    goals: {
      type: [String],
      enum: {
        values: [...GOALS],
        message: "Invalid goal value",
      },
      required: true,

      /*
       * Mongoose normally gives array fields an empty-array default.
       * Setting undefined ensures a missing required array is rejected.
       */
      default: undefined,

      validate: [
        {
          validator: (goals: Goal[] | undefined): boolean => {
            return (
              Array.isArray(goals) &&
              goals.length >= 1 &&
              goals.length <= 3
            );
          },
          message: "Goals must contain between 1 and 3 values",
        },
        {
          validator: (goals: Goal[] | undefined): boolean => {
            return Array.isArray(goals) && hasUniqueValues(goals);
          },
          message: "Goals must not contain duplicate values",
        },
      ],
    },

    availableEquipment: {
      type: [String],
      enum: {
        values: [...EQUIPMENT_OPTIONS],
        message: "Invalid equipment value",
      },
      required: true,

      /*
       * A missing equipment array must not automatically become [].
       */
      default: undefined,

      validate: [
        {
          validator: (
            equipment: Equipment[] | undefined
          ): boolean => {
            return (
              Array.isArray(equipment) &&
              equipment.length >= 1
            );
          },
          message: "At least one equipment option is required",
        },
        {
          validator: (
            equipment: Equipment[] | undefined
          ): boolean => {
            return (
              Array.isArray(equipment) &&
              hasUniqueValues(equipment)
            );
          },
          message: "Equipment must not contain duplicate values",
        },
      ],
    },

    /*
     * This field is optional.
     *
     * [] means the trainee skipped the health section.
     * ["none"] means the trainee explicitly reported no known
     * training-related limitations.
     */
    medicalConditions: {
      type: [String],
      enum: {
        values: [...MEDICAL_CONDITIONS],
        message: "Invalid medical condition value",
      },
      default: [],

      validate: [
        {
          validator: (
            conditions: MedicalCondition[] | undefined
          ): boolean => {
            return (
              conditions === undefined ||
              hasUniqueValues(conditions)
            );
          },
          message:
            "Medical conditions must not contain duplicate values",
        },
        {
          validator: (
            conditions: MedicalCondition[] | undefined
          ): boolean => {
            if (!conditions) {
              return true;
            }

            return (
              !conditions.includes("none") ||
              conditions.length === 1
            );
          },
          message:
            '"none" cannot be selected together with another medical condition',
        },
      ],
    },

    medicalNotes: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Medical notes must contain at most 500 characters",
      ],
      required: false,

      /*
       * Prevent an empty or whitespace-only string from being
       * stored in MongoDB.
       */
      set: (value: string | undefined): string | undefined => {
        if (typeof value !== "string") {
          return undefined;
        }

        const trimmedValue = value.trim();

        return trimmedValue.length > 0
          ? trimmedValue
          : undefined;
      },
    },

    weeklyWorkouts: {
      type: Number,
      required: true,
      min: [1, "Weekly workouts must be at least 1"],
      max: [6, "Weekly workouts must be at most 6"],
      validate: {
        validator: Number.isInteger,
        message: "Weekly workouts must be an integer",
      },
    },

    preferredWorkoutTime: {
      type: String,
      enum: {
        values: [...PREFERRED_WORKOUT_TIMES],
        message: "Invalid preferred workout time",
      },
      required: true,
    },

    sessionDurationMinutes: {
      type: Number,
      enum: {
        values: [...SESSION_DURATION_OPTIONS],
        message:
          "Session duration must be 30, 45, 60, or 90 minutes",
      },
      required: true,
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