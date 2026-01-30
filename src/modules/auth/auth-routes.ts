// ============================================================================
// FILE: src/modules/auth/auth.routes.ts
// AUTH ROUTES - All authentication endpoints
// ============================================================================

import { Router } from "express";
import { AuthController } from "./auth.controller";
import type { Router as ExpressRouter } from "express";
import { authValidation } from "./auth.validation";
import { validate } from "../../middleware/validation.middleware";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { rateLimitMiddleware } from "../../middleware/rate-limit.middleware";
const router: ExpressRouter = Router();
const controller = new AuthController();
const authMiddleware = new AuthMiddleware();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * Health check endpoint
 * @route GET /auth/health
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth service is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * User registration
 * @route POST /auth/register
 */
router.post(
  "/register",
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  validate(authValidation.register),
  controller.register,
);

/**
 * User login
 * @route POST /auth/login
 */
router.post(
  "/login",
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  validate(authValidation.login),
  controller.login,
);

/**
 * Refresh access token
 * @route POST /auth/refresh-token
 */
router.post(
  "/refresh-token",
  validate(authValidation.refreshToken),
  controller.refreshToken,
);

/**
 * Resend email verification OTP
 * @route POST /auth/resend-email-otp
 */
router.post(
  "/resend-email-otp",
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 requests per 15 minutes
  validate(authValidation.resendEmailOTP),
  controller.resendEmailOTP,
);

/**
 * Verify email with OTP
 * @route POST /auth/verify-email
 */
router.post(
  "/verify-email",
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  validate(authValidation.verifyEmail),
  controller.verifyEmail,
);

// ============================================================================
// PASSWORD RESET ROUTES (PUBLIC)
// ============================================================================

/**
 * Request password reset link
 * @route POST /auth/forgot-password
 * @description Always returns success for security (prevents user enumeration)
 */
router.post(
  "/forgot-password",
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 requests per 15 minutes
  validate(authValidation.forgotPassword),
  controller.forgotPassword,
);

/**
 * Validate password reset token
 * @route POST /auth/validate-reset-token
 * @description Validates if reset token is valid and not expired
 */
router.post(
  "/validate-reset-token",
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  validate(authValidation.validateResetToken),
  controller.validateResetToken,
);

/**
 * Reset password with token
 * @route POST /auth/reset-password
 * @description Resets user password and invalidates all sessions
 */
router.post(
  "/reset-password",
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  validate(authValidation.resetPassword),
  controller.resetPassword,
);

// ============================================================================
// PROTECTED ROUTES (REQUIRE AUTHENTICATION)
// ============================================================================

/**
 * Get current authenticated user
 * @route GET /auth/me
 * @access Protected
 */
router.get(
  "/me",
  authMiddleware.authenticate,
  controller.me,
);

/**
 * Send email verification OTP
 * @route POST /auth/send-email-otp
 * @access Protected
 */
router.post(
  "/send-email-otp",
  authMiddleware.authenticate,
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 requests per 15 minutes
  controller.sendEmailOTP,
);

/**
 * Logout current user
 * @route POST /auth/logout
 * @access Protected
 * @description Invalidates refresh token for current session
 */
router.post(
  "/logout",
  authMiddleware.authenticate,
  controller.logout,
);

/**
 * Logout from all devices
 * @route POST /auth/logout-all
 * @access Protected
 * @description Invalidates all refresh tokens for user
 */
router.post(
  "/logout-all",
  authMiddleware.authenticate,
  controller.logoutAll,
);

export default router;