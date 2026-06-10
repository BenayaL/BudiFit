import mongoose, { Document, Schema, Types } from "mongoose";
import crypto from "crypto";

export function generateCoachCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
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
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  hasCompletedOnboarding: boolean;
  settings: UserSettings;
  coachConnectionCode?: string;
  coachId?: Types.ObjectId;
  createdAt: Date;
}

const NotificationSettingsSchema = new Schema<NotificationSettings>(
  {
    dailyWorkoutReminder: { type: Boolean, default: true },
    coachMessages: { type: Boolean, default: true },
    challengeUpdates: { type: Boolean, default: true },
    reminderTime: { type: String, default: "08:00" },
  },
  { _id: false }
);

const UserSettingsSchema = new Schema<UserSettings>(
  {
    notifications: {
      type: NotificationSettingsSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, unique: true, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["trainee", "coach"], default: "trainee" },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    goals: { type: [String], default: [] },
    hasCompletedOnboarding: { type: Boolean, default: false },
    settings: { type: UserSettingsSchema, default: () => ({}) },
    coachConnectionCode: { type: String, unique: true, sparse: true },
    coachId: { type: Schema.Types.ObjectId, ref: "Users" },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "Users",
    versionKey: false,
  }
);

export default mongoose.model<IUser>("Users", UserSchema);
