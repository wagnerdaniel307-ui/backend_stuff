// ============================================================================
// FILE: src/middleware/auth.middleware.ts
// AUTH MIDDLEWARE - Protect routes with JWT verification
// ============================================================================

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { AppError, asyncHandler } from "./error.middleware";
import { AuthUtils } from "../modules/auth/auth.utils";

export class AuthMiddleware {
  /**
   * Authenticate user via JWT token
   */
  authenticate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError(401, "No token provided");
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        throw new AppError(401, "Invalid token format");
      }

      try {
        // Verify token
        const decoded = AuthUtils.verifyAccessToken(token);

        // Get user from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });

        if (!user) {
          throw new AppError(401, "User not found");
        }

        // Check if user is active
        if (user.status === "BANNED" || user.status === "SUSPENDED") {
          throw new AppError(403, "Account is suspended or banned");
        }

        // Attach user to request
        req.user = user;

        next();
      } catch (error: any) {
        if (error.name === "JsonWebTokenError") {
          throw new AppError(401, "Invalid token");
        }
        if (error.name === "TokenExpiredError") {
          throw new AppError(401, "Token expired");
        }
        throw error;
      }
    },
  );

  /**
   * Check if user has specific role(s)
   */
  authorize = (...roles: string[]) => {
    return asyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
          throw new AppError(401, "Not authenticated");
        }

        if (!roles.includes(req.user.role)) {
          throw new AppError(
            403,
            "You do not have permission to access this resource",
          );
        }

        next();
      },
    );
  };

  /**
   * Optional authentication (doesn't throw error if no token)
   */
  optionalAuth = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
      }

      const token = authHeader.split(" ")[1];

      try {
        const decoded = AuthUtils.verifyAccessToken(token);

        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });

        if (user && user.status !== "BANNED" && user.status !== "SUSPENDED") {
          req.user = user;
        }
      } catch (error) {
        // Silently fail for optional auth
      }

      next();
    },
  );

  /**
   * Check if email is verified
   */
  requireEmailVerified = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AppError(401, "Not authenticated");
      }

      if (!req.user.emailVerified) {
        throw new AppError(403, "Please verify your email address first");
      }

      next();
    },
  );

  /**
   * Check if phone is verified
   */
  requirePhoneVerified = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new AppError(401, "Not authenticated");
      }

      if (!req.user.phoneVerified) {
        throw new AppError(403, "Please verify your phone number first");
      }

      next();
    },
  );
}
