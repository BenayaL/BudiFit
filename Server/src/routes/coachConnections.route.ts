import express, { Response } from "express";
import User, { generateCoachCode } from "../models/user.model";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware";

const coachConnectionsRouter = express.Router();

// GET /api/coach-connections/me
// For a trainee: returns current coach info or null.
// For a coach: returns their connection code (generating one if missing).
coachConnectionsRouter.get(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;
      const role = req.authUser?.role;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      if (role === "coach") {
        let coach = await User.findById(userId, { coachConnectionCode: 1 });

        if (!coach) {
          res.status(404).json({ message: "User not found" });
          return;
        }

        // Generate code lazily if it was missing (e.g. pre-existing coaches)
        if (!coach.coachConnectionCode) {
          let code: string | undefined;
          for (let i = 0; i < 10; i++) {
            const candidate = generateCoachCode();
            const conflict = await User.findOne({ coachConnectionCode: candidate });
            if (!conflict) { code = candidate; break; }
          }
          if (!code) {
            res.status(500).json({ message: "Failed to generate coach code" });
            return;
          }
          coach = await User.findByIdAndUpdate(
            userId,
            { $set: { coachConnectionCode: code } },
            { new: true, projection: { coachConnectionCode: 1 } }
          );
        }

        res.status(200).json({
          role: "coach",
          coachCode: coach!.coachConnectionCode,
        });
        return;
      }

      // Trainee: return connected coach info
      const trainee = await User.findById(userId, { coachId: 1 });

      if (!trainee) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (!trainee.coachId) {
        res.status(200).json({ role: "trainee", coach: null });
        return;
      }

      const coach = await User.findById(
        trainee.coachId,
        { firstName: 1, lastName: 1, email: 1, coachConnectionCode: 1 }
      );

      if (!coach) {
        // Coach was deleted — clean up the stale reference
        await User.findByIdAndUpdate(userId, { $unset: { coachId: 1 } });
        res.status(200).json({ role: "trainee", coach: null });
        return;
      }

      res.status(200).json({
        role: "trainee",
        coach: {
          id: coach._id.toString(),
          firstName: coach.firstName,
          lastName: coach.lastName,
          email: coach.email,
          coachCode: coach.coachConnectionCode,
        },
      });
    } catch (error) {
      console.error("Failed to get coach connection:", error);
      res.status(500).json({ message: "Failed to get coach connection" });
    }
  }
);

// POST /api/coach-connections/connect
// Body: { coachCode: string }
// Trainee only — connect to a coach using their code.
coachConnectionsRouter.post(
  "/connect",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;
      const role = req.authUser?.role;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      if (role !== "trainee") {
        res.status(403).json({ message: "Only trainees can connect to a coach" });
        return;
      }

      const { coachCode } = req.body;

      if (!coachCode || typeof coachCode !== "string") {
        res.status(400).json({ message: "coachCode is required" });
        return;
      }

      const coach = await User.findOne(
        { coachConnectionCode: coachCode.trim().toUpperCase(), role: "coach" },
        { firstName: 1, lastName: 1, email: 1, coachConnectionCode: 1 }
      );

      if (!coach) {
        res.status(404).json({ message: "No coach found with that code" });
        return;
      }

      const trainee = await User.findById(userId, { coachId: 1 });

      if (trainee?.coachId?.toString() === coach._id.toString()) {
        res.status(409).json({ message: "Already connected to this coach" });
        return;
      }

      await User.findByIdAndUpdate(userId, { $set: { coachId: coach._id } });

      res.status(200).json({
        message: "Connected to coach successfully",
        coach: {
          id: coach._id.toString(),
          firstName: coach.firstName,
          lastName: coach.lastName,
          email: coach.email,
          coachCode: coach.coachConnectionCode,
        },
      });
    } catch (error) {
      console.error("Failed to connect to coach:", error);
      res.status(500).json({ message: "Failed to connect to coach" });
    }
  }
);

// DELETE /api/coach-connections/me
// Trainee only — disconnect from current coach.
coachConnectionsRouter.delete(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.authUser?.userId;
      const role = req.authUser?.role;

      if (!userId) {
        res.status(401).json({ message: "Authenticated user was not found" });
        return;
      }

      if (role !== "trainee") {
        res.status(403).json({ message: "Only trainees can disconnect from a coach" });
        return;
      }

      const result = await User.findByIdAndUpdate(
        userId,
        { $unset: { coachId: 1 } },
        { new: true }
      );

      if (!result) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Failed to disconnect from coach:", error);
      res.status(500).json({ message: "Failed to disconnect from coach" });
    }
  }
);

export default coachConnectionsRouter;
