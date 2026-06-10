import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  authUser?: {
    userId: string;
    role: "trainee" | "coach";
  };
}

interface BudiFitJwtPayload extends JwtPayload {
  userId: string;
  role: "trainee" | "coach";
}

/*
 * Verify the JWT sent in:
 * Authorization: Bearer <token>
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Authentication token is required",
    });
    return;
  }

  const token = authorizationHeader.substring("Bearer ".length);
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is missing from the .env file");

    res.status(500).json({
      message: "Server authentication configuration is missing",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
    }) as BudiFitJwtPayload;

    req.authUser = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}