import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import User, { generateCoachCode } from "../models/user.model";
import type { IUser } from "../models/user.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

const usersRouter = express.Router();

const JWT_EXPIRES_IN = (
  process.env.JWT_EXPIRES_IN ?? "7d"
) as SignOptions["expiresIn"];

// ─── DTO helper ──────────────────────────────────────────────────────────────

export function formatUser(user: IUser) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    role: user.role,
    fitnessLevel: user.fitnessLevel,
    goals: user.goals,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    settings: user.settings,
    coachConnectionCode: user.coachConnectionCode,
    createdAt: user.createdAt,
  };
}

// ─── /me routes must be registered before /:email ────────────────────────────

// GET /api/users/me
usersRouter.get(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      const user = await User.findById(userId, { password: 0 });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(formatUser(user));
    } catch (error) {
      console.error("Failed to get authenticated user:", error);
      res.status(500).json({ message: "Failed to get authenticated user" });
    }
  }
);

// PATCH /api/users/me
usersRouter.patch(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      const { firstName, lastName, username, fitnessLevel, goals } = req.body;

      const updateFields: Partial<{
        firstName: string;
        lastName: string;
        username: string;
        fitnessLevel: string;
        goals: string[];
      }> = {};

      if (firstName !== undefined) {
        const trimmed = String(firstName).trim();
        if (!trimmed) {
          res.status(400).json({ message: "firstName cannot be empty" });
          return;
        }
        updateFields.firstName = trimmed;
      }

      if (lastName !== undefined) {
        const trimmed = String(lastName).trim();
        if (!trimmed) {
          res.status(400).json({ message: "lastName cannot be empty" });
          return;
        }
        updateFields.lastName = trimmed;
      }

      if (username !== undefined) {
        const trimmed = String(username).trim();
        if (!trimmed) {
          res.status(400).json({ message: "username cannot be empty" });
          return;
        }
        const conflict = await User.findOne({ username: trimmed, _id: { $ne: userId } });
        if (conflict) {
          res.status(409).json({ message: "Username already taken" });
          return;
        }
        updateFields.username = trimmed;
      }

      if (fitnessLevel !== undefined) {
        const valid = ["beginner", "intermediate", "advanced"];
        if (!valid.includes(fitnessLevel)) {
          res.status(400).json({ message: "Invalid fitnessLevel" });
          return;
        }
        updateFields.fitnessLevel = fitnessLevel;
      }

      if (Array.isArray(goals)) {
        updateFields.goals = goals.map(String);
      }

      const updated = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true, projection: { password: 0 } }
      );

      if (!updated) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(formatUser(updated));
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  }
);

// GET /api/users/me/settings
usersRouter.get(
  "/me/settings",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      const user = await User.findById(userId, { settings: 1 });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user.settings);
    } catch (error) {
      console.error("Failed to get settings:", error);
      res.status(500).json({ message: "Failed to get settings" });
    }
  }
);

// PATCH /api/users/me/settings
usersRouter.patch(
  "/me/settings",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      const { notifications } = req.body;

      const settingsUpdate: Record<string, unknown> = {};

      if (notifications && typeof notifications === "object") {
        const {
          dailyWorkoutReminder,
          coachMessages,
          challengeUpdates,
          reminderTime,
        } = notifications as Record<string, unknown>;

        if (dailyWorkoutReminder !== undefined)
          settingsUpdate["settings.notifications.dailyWorkoutReminder"] =
            Boolean(dailyWorkoutReminder);
        if (coachMessages !== undefined)
          settingsUpdate["settings.notifications.coachMessages"] =
            Boolean(coachMessages);
        if (challengeUpdates !== undefined)
          settingsUpdate["settings.notifications.challengeUpdates"] =
            Boolean(challengeUpdates);
        if (reminderTime !== undefined) {
          const timeStr = String(reminderTime).trim();
          if (!/^\d{2}:\d{2}$/.test(timeStr)) {
            res.status(400).json({ message: "reminderTime must be HH:MM" });
            return;
          }
          settingsUpdate["settings.notifications.reminderTime"] = timeStr;
        }
      }

      const updated = await User.findByIdAndUpdate(
        userId,
        { $set: settingsUpdate },
        { new: true, runValidators: true, projection: { settings: 1 } }
      );

      if (!updated) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(updated.settings);
    } catch (error) {
      console.error("Failed to update settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  }
);

// POST /api/users/logout
usersRouter.post(
  "/logout",
  authenticateToken,
  (_req: AuthenticatedRequest, res: Response) => {
    // Stateless JWT: no server-side token invalidation needed.
    // The client is responsible for discarding the token after this call.
    res.status(204).send();
  }
);

// ─── Public routes ────────────────────────────────────────────────────────────

// GET /api/users
usersRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch {
    res.status(500).json({ message: "Failed to get users" });
  }
});

// GET /api/users/:email
usersRouter.get("/:email", async (req: Request, res: Response) => {
  try {
    const user = await User.findOne(
      { email: req.params.email },
      { password: 0 }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Failed to get user" });
  }
});

// POST /api/users/register
usersRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, email, password, role, fitnessLevel, goals } =
      req.body;

    if (!firstName || !lastName || !username || !email || !password || !role) {
      res.status(400).json({ message: "All required fields must be provided" });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim();

    const emailMatch = await User.findOne({ email: normalizedEmail });
    if (emailMatch) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const usernameMatch = await User.findOne({ username: normalizedUsername });
    if (usernameMatch) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Generate a unique connection code for coaches
    let coachConnectionCode: string | undefined;
    if (role === "coach") {
      let attempts = 0;
      while (attempts < 10) {
        const candidate = generateCoachCode();
        const conflict = await User.findOne({ coachConnectionCode: candidate });
        if (!conflict) {
          coachConnectionCode = candidate;
          break;
        }
        attempts++;
      }
      if (!coachConnectionCode) {
        res.status(500).json({ message: "Failed to generate coach code" });
        return;
      }
    }

    const user = new User({
      firstName,
      lastName,
      username: normalizedUsername,
      email: normalizedEmail,
      password: passwordHash,
      role,
      fitnessLevel,
      goals,
      coachConnectionCode,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        fitnessLevel: user.fitnessLevel,
        goals: user.goals,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
    });
  } catch (error) {
    console.error("Failed to register user:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
});

// POST /api/users/login
usersRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const passwordMatches = await bcrypt.compare(String(password), user.password);

    if (!passwordMatches) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is missing from the .env file");
      res.status(500).json({ message: "Server authentication configuration is missing" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      jwtSecret,
      { expiresIn: JWT_EXPIRES_IN, algorithm: "HS256" }
    );

    res.status(200).json({
      token,
      userId: user._id.toString(),
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    });
  } catch (error) {
    console.error("Failed to login:", error);
    res.status(500).json({ message: "Failed to login" });
  }
});

export default usersRouter;
