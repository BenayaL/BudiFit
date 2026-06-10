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

const IS_DEV = process.env.NODE_ENV !== "production";

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
  if (IS_DEV) console.log("[REGISTER] Request received");

  try {
    const { firstName, lastName, username, email, password, role, fitnessLevel, goals } =
      req.body;

    if (IS_DEV) {
      console.log(
        `[REGISTER] Required fields present — firstName: ${Boolean(firstName)}, ` +
        `lastName: ${Boolean(lastName)}, username: ${Boolean(username)}, ` +
        `email: ${Boolean(email)}, password: ${Boolean(password)}, role: ${Boolean(role)}`
      );
    }

    if (!firstName || !lastName || !username || !email || !password || !role) {
      res.status(400).json({ message: "All required fields must be provided" });
      return;
    }

    if (role !== "trainee" && role !== "coach") {
      res.status(400).json({ message: "Role must be trainee or coach" });
      return;
    }

    const normalizedEmail    = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim();
    const normalizedFirst    = String(firstName).trim();
    const normalizedLast     = String(lastName).trim();

    if (!normalizedEmail || !normalizedUsername || !normalizedFirst || !normalizedLast) {
      res.status(400).json({ message: "All required fields must be provided" });
      return;
    }

    if (IS_DEV) {
      console.log(`[REGISTER] Normalized email: ${normalizedEmail}`);
      console.log(`[REGISTER] Normalized username: ${normalizedUsername}`);
      console.log(`[REGISTER] Requested role: ${role}`);
    }

    if (IS_DEV) console.log("[REGISTER] Email lookup started");
    const emailMatch = await User.findOne({ email: normalizedEmail });
    if (IS_DEV) console.log(`[REGISTER] Email conflict found: ${Boolean(emailMatch)}`);
    if (emailMatch) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    if (IS_DEV) console.log("[REGISTER] Username lookup started");
    const usernameMatch = await User.findOne({ username: normalizedUsername });
    if (IS_DEV) console.log(`[REGISTER] Username conflict found: ${Boolean(usernameMatch)}`);
    if (usernameMatch) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    if (IS_DEV) console.log("[REGISTER] Password hashing started");
    const passwordHash = await bcrypt.hash(String(password), 12);
    if (IS_DEV) console.log("[REGISTER] Password hashing completed");

    // Generate a unique connection code for coaches
    let coachConnectionCode: string | undefined;
    if (role === "coach") {
      if (IS_DEV) console.log("[REGISTER] Coach code generation started");
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
      if (IS_DEV) {
        console.log(`[REGISTER] Coach code generation completed — success: ${Boolean(coachConnectionCode)}`);
      }
      if (!coachConnectionCode) {
        res.status(500).json({ message: "Failed to generate coach code" });
        return;
      }
    }

    if (IS_DEV) console.log("[REGISTER] Creating user document");

    // Only include optional fields when defined to avoid storing
    // explicit undefined/null values against sparse-indexed fields.
    const user = new User({
      firstName: normalizedFirst,
      lastName: normalizedLast,
      username: normalizedUsername,
      email: normalizedEmail,
      password: passwordHash,
      role,
      ...(fitnessLevel !== undefined ? { fitnessLevel } : {}),
      ...(Array.isArray(goals) ? { goals } : {}),
      ...(coachConnectionCode !== undefined ? { coachConnectionCode } : {}),
    });

    if (IS_DEV) console.log("[REGISTER] Saving user document");
    await user.save();
    if (IS_DEV) console.log("[REGISTER] User saved successfully");

    if (IS_DEV) console.log("[REGISTER] Sending success response");
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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    console.error("[REGISTER] Unexpected error caught:");
    console.error(`  name:    ${err.name}`);
    console.error(`  message: ${err.message}`);
    console.error(`  stack:   ${err.stack ?? "(no stack)"}`);

    // MongoDB driver error fields — narrowed without using any
    const mongoLike = error as {
      code?: unknown;
      keyPattern?: Record<string, unknown>;
      keyValue?: Record<string, unknown>;
    };

    if (mongoLike.code !== undefined)
      console.error(`  code:       ${String(mongoLike.code)}`);
    if (mongoLike.keyPattern !== undefined)
      console.error(`  keyPattern: ${JSON.stringify(mongoLike.keyPattern)}`);
    if (mongoLike.keyValue !== undefined)
      console.error(`  keyValue:   ${JSON.stringify(mongoLike.keyValue)}`);

    // Mongoose validation error details
    if (err.name === "ValidationError") {
      const valErr = error as { errors?: Record<string, { message: string }> };
      if (valErr.errors) {
        console.error("  Mongoose validation errors:");
        for (const [field, detail] of Object.entries(valErr.errors)) {
          console.error(`    ${field}: ${detail.message}`);
        }
      }
    }

    // Node 16.9+ cause field
    const withCause = error as { cause?: unknown };
    if (withCause.cause !== undefined)
      console.error(`  cause: ${String(withCause.cause)}`);

    // ── E11000 duplicate key ──────────────────────────────────────────────────
    if (mongoLike.code === 11000 && mongoLike.keyPattern) {
      const field = Object.keys(mongoLike.keyPattern)[0];

      if (field === "email") {
        res.status(409).json({ message: "Email already exists" });
        return;
      }
      if (field === "username") {
        res.status(409).json({ message: "Username already exists" });
        return;
      }
      if (field === "coachConnectionCode") {
        const dupValue = mongoLike.keyValue?.["coachConnectionCode"];
        if (dupValue === null || dupValue === undefined) {
          // The unique index on coachConnectionCode is missing sparse:true.
          // Every trainee document (no coachConnectionCode) is indexed as null,
          // and the second trainee triggers E11000.
          // Fix: db.Users.dropIndex("coachConnectionCode_1") then restart server.
          console.error(
            "[REGISTER] E11000 on coachConnectionCode with null value — " +
            "the coachConnectionCode_1 index in MongoDB is NOT sparse. " +
            "Manual fix required: in MongoDB Compass / Atlas shell run:\n" +
            "  db.Users.dropIndex('coachConnectionCode_1')\n" +
            "then restart the server so Mongoose recreates it with sparse:true."
          );
          const body: { message: string; error?: string } = {
            message: "Failed to register user",
          };
          if (IS_DEV) {
            body.error =
              "Database index misconfiguration: coachConnectionCode_1 is not sparse. " +
              "Run db.Users.dropIndex('coachConnectionCode_1') then restart the server.";
          }
          res.status(500).json(body);
        } else {
          // The code generation loop should have prevented this; treat as 409.
          res.status(409).json({ message: "Coach code conflict. Please try again." });
        }
        return;
      }

      // Unknown field — return 409 generically
      const body: { message: string; error?: string } = {
        message: "A conflict occurred. Please check your input.",
      };
      if (IS_DEV) body.error = `Duplicate key on field: ${field ?? "unknown"}`;
      res.status(409).json(body);
      return;
    }

    // ── Mongoose validation error → 400 ──────────────────────────────────────
    if (err.name === "ValidationError") {
      const body: { message: string; error?: string } = {
        message: "Invalid registration data",
      };
      if (IS_DEV) body.error = err.message;
      res.status(400).json(body);
      return;
    }

    // ── Unexpected error → 500 ────────────────────────────────────────────────
    const body: { success: false; message: string; error?: string } = {
      success: false,
      message: "Failed to register user",
    };
    if (IS_DEV) body.error = err.message;
    res.status(500).json(body);
  }
});

// POST /api/users/login
usersRouter.post("/login", async (req: Request, res: Response) => {
  console.log("[LOGIN] Request received");

  try {
    const { email, password } = req.body;

    const emailProvided = Boolean(email);
    const passwordProvided = Boolean(password);
    console.log(`[LOGIN] Fields — email: ${emailProvided}, password: ${passwordProvided}`);

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    console.log(`[LOGIN] Normalized email: ${normalizedEmail}`);

    console.log("[LOGIN] MongoDB user lookup started");
    const user = await User.findOne({ email: normalizedEmail });
    console.log(`[LOGIN] User found: ${Boolean(user)}`);

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Guard against documents that pre-date password hashing or that have
    // a corrupted/empty password field — bcrypt.compare throws on those.
    const storedPasswordExists = user.password != null && user.password !== "";
    const hashFormatValid =
      storedPasswordExists && /^\$2[aby]\$\d{2}\$/.test(user.password);
    console.log(`[LOGIN] Stored password exists: ${storedPasswordExists}`);
    console.log(`[LOGIN] Password hash format valid: ${hashFormatValid}`);

    if (!storedPasswordExists || !hashFormatValid) {
      console.error(
        `[LOGIN] User ${normalizedEmail} has no valid bcrypt hash stored — cannot authenticate`
      );
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    console.log("[LOGIN] bcrypt comparison started");
    const passwordMatches = await bcrypt.compare(String(password), user.password);
    console.log(`[LOGIN] bcrypt comparison complete — match: ${passwordMatches}`);

    if (!passwordMatches) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    console.log(`[LOGIN] JWT_SECRET present: ${Boolean(jwtSecret)}`);

    if (!jwtSecret) {
      console.error("[LOGIN] JWT_SECRET is missing from the .env file");
      res.status(500).json({ message: "Server authentication configuration is missing" });
      return;
    }

    console.log("[LOGIN] Signing JWT...");
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      jwtSecret,
      { expiresIn: JWT_EXPIRES_IN, algorithm: "HS256" }
    );
    console.log("[LOGIN] JWT signed successfully");

    console.log("[LOGIN] Sending success response");
    res.status(200).json({
      token,
      userId: user._id.toString(),
      role: user.role,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[LOGIN] Unexpected error caught:");
    console.error(`  name:    ${err.name}`);
    console.error(`  message: ${err.message}`);
    console.error(`  stack:   ${err.stack ?? "(no stack)"}`);

    if (error !== null && typeof error === "object") {
      const maybeMongoErr = error as Record<string, unknown>;
      if (maybeMongoErr["code"] !== undefined)
        console.error(`  code:     ${String(maybeMongoErr["code"])}`);
      if (maybeMongoErr["codeName"] !== undefined)
        console.error(`  codeName: ${String(maybeMongoErr["codeName"])}`);
    }

    const body: { success: false; message: string; error?: string } = {
      success: false,
      message: "Failed to login",
    };

    if (IS_DEV) {
      body.error = err.message;
    }

    res.status(500).json(body);
  }
});

export default usersRouter;
