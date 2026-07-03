import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import usersRouter            from "./routes/users.route";
import traineeProfileRouter   from "./routes/TraineeProfile.route";
import coachConnectionsRouter from "./routes/coachConnections.route";
import coachRouter            from "./routes/coach.routes";
import progressRouter         from "./routes/progress.routes";
import botRouter              from "./routes/bot.routes";
import exportRouter           from "./routes/export.routes";
import generatedWorkoutPlanRouter from "./routes/generatedWorkoutPlan.routes";
import notificationRouter         from "./routes/notification.routes";
import dailyWorkoutRouter         from "./routes/dailyWorkout.routes";
import exercisePreferenceRouter   from "./routes/exercisePreference.routes";

dotenv.config();

const IS_DEV = process.env.NODE_ENV !== "production";

const app = express();
app.set("trust proxy", 1);

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Always allow localhost for local development.
// CLIENT_URL is the deployed Vercel frontend URL set via environment variable.
const allowedOrigins = [
  "http://localhost:5173",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

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
 * In development, logs method, path, status, and duration with a timestamp.
 * Morgan "dev" already covers most of this; this adds ISO timestamps and
 * fires on the response "finish" event so duration is accurate.
 */
if (IS_DEV) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const startMs = Date.now();
    const ts = new Date().toISOString();
    res.on("finish", () => {
      console.log(
        `[REQ] ${ts} ${req.method} ${req.path} → ${res.statusCode} (${Date.now() - startMs}ms)`
      );
    });
    next();
  });
}

/*
 * Allows requests from the React client.
 *
 * Must run before the rate limiter: every authenticated request carries an
 * Authorization header, which forces the browser to send a CORS preflight
 * (OPTIONS) first. If the limiter ran first, a blocked request would be
 * answered with a 429 that never reaches this middleware — the response
 * would be missing Access-Control-Allow-Origin, and the browser would
 * report the failure as a CORS error instead of a clean 429. Running cors()
 * first also lets it short-circuit OPTIONS preflights with 204 before they
 * reach (and consume) the limiter's quota.
 */
app.use(
  cors({
    origin: allowedOrigins,
  })
);

/*
 * General rate limiter covering all /api routes.
 * Intentionally generous — it is a backstop against runaway clients, not a
 * per-feature throttle. Expensive endpoints (AI generation, auth) carry their
 * own stricter limiters defined in their respective route files.
 *
 * Development gets a higher cap so React StrictMode double-invocation and
 * hot-reload never trigger 429s during normal development work.
 *
 * OPTIONS preflights are not real API calls and must never consume quota —
 * cors() above already answers them directly, but skip is kept as a
 * defense-in-depth guard in case a preflight ever reaches this far.
 */
const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: IS_DEV ? 600 : 300,
  message: {
    success: false,
    message: "Too many requests. Please wait a moment and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => req.method === "OPTIONS",
});

app.use("/api", generalApiLimiter);

/*
 * Allows the server to read JSON request bodies.
 */
app.use(express.json());

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
 * Health check — used by Render to verify the service is alive.
 */
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

/*
 * Application routes.
 */
app.use("/api/users",            usersRouter);
app.use("/api/trainee-profiles", traineeProfileRouter);
app.use("/api/coach-connections", coachConnectionsRouter);
app.use("/api/coach",            coachRouter);
app.use("/api/progress",         progressRouter);
app.use("/api/bot",              botRouter);
app.use("/api/export",           exportRouter);
app.use("/api/generated-workout-plans", generatedWorkoutPlanRouter);
app.use("/api/notifications",           notificationRouter);
app.use("/api/daily-workouts",          dailyWorkoutRouter);
app.use("/api/exercise-preferences",    exercisePreferenceRouter);
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
 * Receives errors passed via next(err) from any route or middleware.
 */
app.use(
  (
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const ts = new Date().toISOString();
    console.error(`[ERROR] ${ts} ${req.method} ${req.originalUrl}`);
    console.error(`  name:    ${error.name}`);
    console.error(`  message: ${error.message}`);
    console.error(`  stack:   ${error.stack ?? "(no stack)"}`);

    const body: { success: false; message: string; error?: string } = {
      success: false,
      message: "Internal server error",
    };

    if (IS_DEV) {
      body.error = error.message;
    }

    res.status(500).json(body);
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

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown startup error";

    console.error("SERVER STARTUP ERROR:", message);
    process.exit(1);
  }
}

mongoose.connection.on("connected", () => {
  console.log("[DB] MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  console.warn("[DB] MongoDB disconnected");
});

mongoose.connection.on("error", (err: Error) => {
  console.error("[DB] MongoDB error:", err.message);
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

process.on("unhandledRejection", (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? (reason.stack ?? "") : "";
  console.error("[PROCESS] Unhandled promise rejection:", message);
  if (stack) console.error(stack);
});

process.on("uncaughtException", (error: Error) => {
  console.error("[PROCESS] Uncaught exception:", error.name, error.message);
  console.error(error.stack ?? "(no stack)");
  // Give MongoDB a chance to close before the forced exit.
  void mongoose.connection.close().finally(() => {
    process.exit(1);
  });
});

void startServer();