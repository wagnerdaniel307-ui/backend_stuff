// ============================================================================
// FILE: src/modules/auth/auth.controller.ts
// AUTH CONTROLLER - HTTP request handlers
// ============================================================================

import { Request, Response } from "express";
import { AppError, asyncHandler } from "../../middleware/error.middleware";
import { ResponseUtil } from "../../utils/response.util";
import { AuthService } from "./auth.authservice";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);

    ResponseUtil.created(res, "Registration successful", result);
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    ResponseUtil.success(res, "Login successful", result);
  });

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  me = asyncHandler(async (req: Request, res: Response) => {
    const { password, ...userWithoutPassword } = req.user!;

    ResponseUtil.success(res, "User profile", { user: userWithoutPassword });
  });

  /**
   * Send email verification OTP
   * POST /api/v1/auth/send-email-otp
   */
  sendEmailOTP = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const result = await this.authService.sendEmailVerificationOTP(userId);

    ResponseUtil.success(res, result.message, result);
  });

  /**
   * Verify email OTP
   * POST /api/v1/auth/verify-email
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await this.authService.verifyEmailOTP(email, otp);
    ResponseUtil.success(res, result.message);
  });

  /**
   * Resend email OTP
   * POST /api/v1/auth/resend-email-otp
   */
  resendEmailOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await this.authService.resendEmailVerificationOTP(email);

    ResponseUtil.success(res, result.message, result);
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await this.authService.refreshToken(refreshToken);

    ResponseUtil.success(res, "Token refreshed successfully", result);
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { refreshToken } = req.body;

    await this.authService.logout(userId, refreshToken);

    ResponseUtil.success(res, "Logged out successfully");
  });

  /**
   * Logout from all devices
   * POST /api/v1/auth/logout-all
   */
  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    await this.authService.logoutAll(userId);

    ResponseUtil.success(res, "Logged out from all devices successfully");
  });

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await this.authService.forgotPassword(email);

    // Always return success for security (prevents user enumeration)
    ResponseUtil.success(
      res,
      "If an account exists with this email, a password reset link has been sent"
    );
  });

  /**
   * Validate password reset token
   * POST /api/v1/auth/validate-reset-token
   */
  validateResetToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    const result = await this.authService.validateResetToken(token);

    ResponseUtil.success(res, "Reset token is valid", result);
  });

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    await this.authService.resetPassword(token, password);

    ResponseUtil.success(res, "Password reset successfully");
  });
}