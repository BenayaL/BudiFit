import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IBotSession extends Document {
  userId: Types.ObjectId;
  sessionId: string;
  messages: IBotMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const BotMessageSchema = new Schema<IBotMessage>(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { _id: false }
);

const BotSessionSchema = new Schema<IBotSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    messages: {
      type: [BotMessageSchema],
      default: [],
    },
  },
  {
    collection: "BotSessions",
    timestamps: true,
    versionKey: false,
  }
);

BotSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
BotSessionSchema.index({ updatedAt: -1 });

const BotSession =
  mongoose.models.BotSessions ||
  mongoose.model<IBotSession>("BotSessions", BotSessionSchema);

export default BotSession;
