// ============================================================================
// FILE: src/modules/users/user.controller.ts
// USER CONTROLLER - HTTP request handlers
// ============================================================================

import { Request, Response } from "express";
import { AppError, asyncHandler } from "../../middleware/error.middleware";
import { ErrorCodes } from "../../constants/error-codes";
import { ResponseUtil } from "../../utils/response.util";
import { UserService } from "./user.service";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get current user profile
   * GET /api/v1/users/profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await this.userService.getUserProfile(userId);

    ResponseUtil.success(res, "User profile retrieved successfully", { user });
  });

  /**
   * Update basic profile information
   * PATCH /api/v1/users/profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const updates = req.body;

    const user = await this.userService.updateBasicProfile(userId, updates);

    ResponseUtil.success(res, "Profile updated successfully", { user });
  });

  /**
   * Request email change
   * POST /api/v1/users/email/request-change
   */
  requestEmailChange = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { newEmail, password } = req.body;

    const result = await this.userService.requestEmailChange(userId, {
      newEmail,
      password,
    });

    ResponseUtil.success(res, result.message, result);
  });

  /**
   * Verify email change with OTP
   * POST /api/v1/users/email/verify-change
   */
  verifyEmailChange = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { otp } = req.body;

    const user = await this.userService.verifyEmailChange(userId, otp);

    ResponseUtil.success(res, "Email changed successfully", { user });
  });

  /**
   * Request phone change
   * POST /api/v1/users/phone/request-change
   */
  requestPhoneChange = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { newPhone, password } = req.body;

    const result = await this.userService.requestPhoneChange(userId, {
      newPhone,
      password,
    });

    ResponseUtil.success(res, result.message, result);
  });

  /**
   * Verify phone change with OTP
   * POST /api/v1/users/phone/verify-change
   */
  verifyPhoneChange = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { otp } = req.body;

    const user = await this.userService.verifyPhoneChange(userId, otp);

    ResponseUtil.success(res, "Phone number changed successfully", { user });
  });

  /**
   * Change password
   * POST /api/v1/users/change-password
   */
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const result = await this.userService.changePassword(userId, {
      currentPassword,
      newPassword,
      confirmPassword,
    });

    ResponseUtil.success(res, result.message);
  });

  /**
   * Update avatar
   */
  updateAvatar = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user!.id;

    if (!req.file) {
      throw new AppError(
        400,
        "Please upload an image file",
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const user = await this.userService.updateAvatar(userId, req.file.buffer);

    ResponseUtil.success(res, "Avatar updated successfully", { user });
  });
}
