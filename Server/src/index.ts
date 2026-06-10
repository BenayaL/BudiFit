import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import usersRouter from "./routes/users.route";
import traineeProfileRouter from "./routes/TraineeProfile.route";
import coachConnectionsRouter from "./routes/coachConnections.route";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/*
 * Security middleware.
 * Helmet adds security-related HTTP headers.
 */
app.use(helmet());

/*
 * Logs every incoming request in the terminal.
 */
app.use(morgan("dev"));

/*
 * Limits the amount of requests sent to API routes.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

/*
 * Allows the server to read JSON request bodies.
 */
app.use(express.json());

/*
 * Allows requests from the React client.
 */
app.use(
  cors({
    origin: CLIENT_URL,
  })
);

/*
 * Prevents responses from being stored in the browser cache.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store");
  next();
});

/*
 * Basic route for checking that the server is running.
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("BudiFit TypeScript server is running");
});

/*
 * Application routes.
 */
app.use("/api/users", usersRouter);
app.use("/api/trainee-profiles", traineeProfileRouter);
app.use("/api/coach-connections", coachConnectionsRouter);

/*
 * Handles requests that do not match any existing route.
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/*
 * General Express error handler.
 */
app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error("UNHANDLED SERVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

/*
 * Connects to MongoDB first.
 * The Express server starts only if the database connection succeeds.
 */
async function startServer(): Promise<void> {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file");
    }

    await mongoose.connect(MONGO_URI);

    console.log("DB STATUS: Connected Successfully");
    console.log("Connected database name:", mongoose.connection.name);
    console.log("Connected database host:", mongoose.connection.host);

    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Server running on http://127.0.0.1:${PORT}`);
      console.log(`Allowed client URL: ${CLIENT_URL}`);
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown startup error";

    console.error("SERVER STARTUP ERROR:", message);
    process.exit(1);
  }
}

/*
 * Logs database disconnection events.
 */
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

/*
 * Gracefully closes the MongoDB connection when the server stops.
 */
async function shutdownServer(signal: string): Promise<void> {
  try {
    console.log(`${signal} received. Closing MongoDB connection...`);

    await mongoose.connection.close();

    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Failed to close MongoDB connection:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdownServer("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdownServer("SIGTERM");
});

void startServer();