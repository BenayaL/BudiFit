import express, { Request, Response } from "express";
import User from "../models/user.model";

const usersRouter = express.Router();

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

// POST /api/users/register
// user registration with email, name, password, role, fitnessLevel and goals
usersRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const user = new User(req.body);
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        fitnessLevel: user.fitnessLevel,
        goals: user.goals,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user" });
  }
});

// POST /api/users/login
// user login by email and password
usersRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        fitnessLevel: user.fitnessLevel,
        goals: user.goals,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login" });
  }
});

// PUT /api/users/update/:email
//update user info by email (except password)
usersRouter.put("/update/:email", async (req: Request, res: Response) => {
  try {
    const result = await User.updateOne(
      { email: req.params.email },
      { $set: req.body }
    );

    res.status(200).json({
      message: "User updated successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

export default usersRouter;