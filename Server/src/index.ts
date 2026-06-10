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
app.use(helmet());
app.use(morgan("dev"));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "localhost:27017";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

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
app.use(express.json());

app.use(
  cors({
    origin: CLIENT_URL,
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-store");
  next();
});

if (!MONGO_URI) {
  console.error("MONGO_URI is missing from .env file");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("DB STATUS: Connected Successfully"))
    .catch((err: Error) =>
      console.error("DB CONNECTION ERROR:", err.message)
    );
}

mongoose.connection.once("open", () => {
  console.log("Connected database name:", mongoose.connection.name);
  console.log("Connected database host:", mongoose.connection.host);
});

app.get("/", (_req: Request, res: Response) => {
  res.send("BudiFit TypeScript server is running");
});

app.use("/api/users", usersRouter);
app.use("/api/trainee-profiles", traineeProfileRouter);
app.use("/api/coach-connections", coachConnectionsRouter);

app.listen(Number(PORT), "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
