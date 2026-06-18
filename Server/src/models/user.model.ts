import crypto from "crypto";
import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

import {
  FITNESS_LEVELS,
  GOALS,
  type FitnessLevel,
  type Goal,
} from "./TraineeProfile.types";

/**
 * Generates a random connection code for a coach.
 */
export function generateCoachCode(): string {
  return crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();
}

interface NotificationSettings {
  dailyWorkoutReminder: boolean;
  coachMessages: boolean;
  challengeUpdates: boolean;
  reminderTime: string;
}

interface UserSettings {
  notifications: NotificationSettings;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;

  role: "trainee" | "coach";

  /*
   * These are onboarding summary fields.
   * A new user has not selected them yet, so fitnessLevel
   * remains undefined and goals remains an empty array.
   */
  fitnessLevel?: FitnessLevel;
  goals: Goal[];
  hasCompletedOnboarding: boolean;

  settings: UserSettings;

  avatarIcon?: string;

  coachConnectionCode?: string;
  coachId?: Types.ObjectId;

  createdAt: Date;
}

/**
 * Checks that an array contains no duplicate values.
 */
const hasUniqueValues = <T>(values: T[]): boolean => {
  return new Set(values).size === values.length;
};

const NotificationSettingsSchema =
  new Schema<NotificationSettings>(
    {
      dailyWorkoutReminder: {
        type: Boolean,
        default: true,
      },

      coachMessages: {
        type: Boolean,
        default: true,
      },

      challengeUpdates: {
        type: Boolean,
        default: true,
      },

      reminderTime: {
        type: String,
        default: "08:00",
      },
    },
    {
      _id: false,
    }
  );

const UserSettingsSchema = new Schema<UserSettings>(
  {
    notifications: {
      type: NotificationSettingsSchema,
      default: () => ({}),
    },
  },
  {
    _id: false,
  }
);

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["trainee", "coach"],
      default: "trainee",
    },

    /*
     * No default is used here.
     *
     * A trainee selects the real fitness level during onboarding.
     * Coaches do not need a trainee fitness level.
     */
    fitnessLevel: {
      type: String,
      enum: {
        values: [...FITNESS_LEVELS],
        message: "Invalid fitness level",
      },
      required: false,
    },

    /*
     * The Users collection stores only a summary of the selected
     * goals. The full trainee profile remains in TraineeProfiles.
     *
     * An empty array is valid before onboarding is completed.
     */
    goals: {
      type: [String],

      enum: {
        values: [...GOALS],
        message: "Invalid goal value",
      },

      default: [],

      validate: [
        {
          validator: (
            goals: Goal[] | undefined
          ): boolean => {
            return (
              goals === undefined ||
              goals.length <= 3
            );
          },

          message:
            "Goals must contain no more than 3 values",
        },

        {
          validator: (
            goals: Goal[] | undefined
          ): boolean => {
            return (
              goals === undefined ||
              hasUniqueValues(goals)
            );
          },

          message:
            "Goals must not contain duplicate values",
        },
      ],
    },

    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },

    settings: {
      type: UserSettingsSchema,
      default: () => ({}),
    },

    /*
     * sparse: true is important.
     *
     * Trainees normally do not have a coach connection code.
     * The sparse unique index prevents missing values from
     * conflicting with one another.
     */
    avatarIcon: {
      type: String,
      required: false,
    },

    coachConnectionCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    coachId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "Users",
    versionKey: false,
  }
);

export default mongoose.model<IUser>(
  "Users",
  UserSchema
);