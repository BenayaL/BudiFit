import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import User from "../models/user.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

const usersRouter = express.Router();

const JWT_EXPIRES_IN = (
  process.env.JWT_EXPIRES_IN ?? "7d"
) as SignOptions["expiresIn"];


// GET /api/users/me
// Return the authenticated user's information
usersRouter.get("/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUser?.userId;

    if (!userId) {
      res.status(401).json({
        message: "Authenticated user was not found",
      });
      return;
    }

    const user = await User.findById(
      userId,
      { password: 0 }
    );

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Failed to get authenticated user:", error);

    res.status(500).json({
      message: "Failed to get authenticated user",
    });
  }
}
);

// GET /api/users
//get all users without password
usersRouter.get("/", async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to get users" });
  }
});

// GET /api/users/:email
//get user by email without password
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
  } catch (error) {
    res.status(500).json({ message: "Failed to get user" });
  }
});

/// POST /api/users/register
// Register a new user and store only a hashed password
usersRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      role,
      fitnessLevel,
      goals,
    } = req.body;

    // Basic request validation
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !role
    ) {
      res.status(400).json({
        message: "All required fields must be provided",
      });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim();

    // Check whether the email already exists
    const emailMatch = await User.findOne({
      email: normalizedEmail,
    });

    if (emailMatch) {
      res.status(409).json({
        message: "Email already exists",
      });
      return;
    }

    // Check whether the username already exists
    const usernameMatch = await User.findOne({
      username: normalizedUsername,
    });

    if (usernameMatch) {
      res.status(409).json({
        message: "Username already exists",
      });
      return;
    }

    /*
     * Convert the plain password into a secure hash.
     * 12 is the bcrypt cost factor.
     */
    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User({
      firstName,
      lastName,
      username: normalizedUsername,
      email: normalizedEmail,

      // Never store the original password
      password: passwordHash,

      role,
      fitnessLevel,
      goals,
    });

    await user.save();

    // Never return the password or its hash to the client
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
      },
    });
  } catch (error) {
    console.error("Failed to register user:", error);

    res.status(500).json({
      message: "Failed to register user",
    });
  }
});

// POST /api/users/login
// Validate the password and create a signed JWT
usersRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Search only by email because the stored password is hashed
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    // Compare the entered password with the hash stored in MongoDB
    const passwordMatches = await bcrypt.compare(
      String(password),
      user.password
    );

    if (!passwordMatches) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    // Read the secret only after dotenv has loaded the environment
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is missing from the .env file");

      res.status(500).json({
        message: "Server authentication configuration is missing",
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: "HS256",
      }
    );

    res.status(200).json({
      token,
      userId: user._id.toString(),
      role: user.role,
      hasCompletedOnboarding: false,
    });
  } catch (error) {
    console.error("Failed to login:", error);

    res.status(500).json({
      message: "Failed to login",
    });
  }
});

// PUT /api/users/update/:email
// Update user information without allowing direct password changes
usersRouter.put(
  "/update/:email",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        firstName,
        lastName,
        username,
        fitnessLevel,
        goals,
      } = req.body;

      // Convert the route parameter to a string before using trim()
      const email = String(req.params.email)
        .trim()
        .toLowerCase();

      const result = await User.updateOne(
        { email },
        {
          $set: {
            firstName,
            lastName,
            username,
            fitnessLevel,
            goals,
          },
        }
      );

      if (result.matchedCount === 0) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        message: "User updated successfully",
        result,
      });
    } catch (error) {
      console.error("Failed to update user:", error);

      res.status(500).json({
        message: "Failed to update user",
      });
    }
  }
);

export default usersRouter;