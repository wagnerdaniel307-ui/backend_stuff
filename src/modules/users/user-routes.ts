// ============================================================================
// FILE: src/modules/users/user-routes.ts
// USER ROUTES - All user profile management endpoints
// ============================================================================

import { Router } from "express";
import { UserController } from "./user.controller";
import type { Router as ExpressRouter } from "express";
import { userValidation } from "./user.validation";
import { validate } from "../../middleware/validation.middleware";
import { AuthMiddleware } from "../../middleware/auth.middleware";
import { rateLimitMiddleware } from "../../middleware/rate-limit.middleware";
import { upload } from "../../middleware/upload.middleware";

const router: ExpressRouter = Router();
const controller = new UserController();
const authMiddleware = new AuthMiddleware();

// ============================================================================
// ALL ROUTES ARE PROTECTED - REQUIRE AUTHENTICATION
// ============================================================================

/**
 * Health check endpoint
 * @route GET /users/health
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User service is running",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// PROFILE MANAGEMENT ROUTES
// ============================================================================

/**
 * Get current user profile
 * @route GET /users/profile
 * @access Protected
 */
router.get(
  "/profile",
  authMiddleware.authenticate,
  controller.getProfile,
);

/**
 * Update basic profile information
 * @route PATCH /users/profile
 * @access Protected
 */
router.patch(
  "/profile",
  authMiddleware.authenticate,
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  validate(userValidation.updateBasicProfile),
  controller.updateProfile,
);

// ============================================================================
// EMAIL CHANGE ROUTES
// ============================================================================

/**
 * Request email change (sends OTP to new email)
 * @route POST /users/email/request-change
 * @access Protected
 * @description Requires password for security
 */
router.post(
  "/email/request-change",
  authMiddleware.authenticate,
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 requests per 15 minutes
  validate(userValidation.requestEmailChange),
  controller.requestEmailChange,
);

/**
 * Verify email change with OTP
 * @route POST /users/email/verify-change
 * @access Protected
 */
router.post(
  "/email/verify-change",
  authMiddleware.authenticate,
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  validate(userValidation.verifyEmailChange),
  controller.verifyEmailChange,
);

// ============================================================================
// PHONE CHANGE ROUTES
// ============================================================================

/**
 * Request phone change (sends OTP to new phone)
 * @route POST /users/phone/request-change
 * @access Protected
 * @description Requires password for security
 */
router.post(
  "/phone/request-change",
  authMiddleware.authenticate,
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 requests per 15 minutes
  validate(userValidation.requestPhoneChange),
  controller.requestPhoneChange,
);

/**
 * Verify phone change with OTP
 * @route POST /users/phone/verify-change
 * @access Protected
 */
router.post(
  "/phone/verify-change",
  authMiddleware.authenticate,
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  validate(userValidation.verifyPhoneChange),
  controller.verifyPhoneChange,
);

// ============================================================================
// PASSWORD CHANGE ROUTE
// ============================================================================

/**
 * Change password
 * @route POST /users/change-password
 * @access Protected
 * @description Requires current password and logs out all devices
 */
router.post(
  "/change-password",
  authMiddleware.authenticate,
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  validate(userValidation.changePassword),
  controller.changePassword,
);

// ============================================================================
// AVATAR ROUTES
// ============================================================================

/**
 * Update avatar file
 * @route PATCH /users/avatar
 * @access Protected
 */
router.patch(
  "/avatar",
  authMiddleware.authenticate,
  upload.single("avatar"),
  validate(userValidation.updateAvatar),
  controller.updateAvatar,
);

export default router;
