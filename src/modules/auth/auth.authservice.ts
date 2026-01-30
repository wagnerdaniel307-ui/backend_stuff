// ============================================================================
// FILE: src/modules/auth/auth.service.ts
// AUTH SERVICE - Business logic for authentication
// ============================================================================

import { prisma } from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import { EmailService } from "../../services/email-services";
import { AuthUtils } from "./auth.utils";
import { ErrorCodes } from "../../constants/error-codes";

interface RegisterInput {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Register new user
   */
  async register(data: RegisterInput) {
    const { email, phone, password, firstName, lastName, referralCode } = data;

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      // Check if email is not verified - RESEND OTP
      if (!existingEmail.emailVerified) {
        // Generate new OTP
        const otp = AuthUtils.generateOTP();
        const expiry = AuthUtils.getOTPExpiry();

        // Update OTP in database
        await prisma.user.update({
          where: { id: existingEmail.id },
          data: {
            emailVerificationOtp: otp,
            emailVerificationExpiry: expiry,
          },
        });

        // Send verification email
        try {
          await this.emailService.sendVerificationEmail(
            existingEmail.email,
            existingEmail.firstName,
            otp,
          );
        } catch (error) {
          console.error("Failed to send verification email:", error);
        }

        throw new AppError(
          403,
          "Email already registered but not verified. We've sent a new verification code to your email.",
          ErrorCodes.EMAIL_NOT_VERIFIED,
        );
      }

      // Email verified - already exists
      throw new AppError(
        400,
        "Email already registered",
        ErrorCodes.EMAIL_ALREADY_EXISTS,
      );
    }

    // Check if phone already exists
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      throw new AppError(
        400,
        "Phone number already registered",
        ErrorCodes.PHONE_ALREADY_EXISTS,
      );
    }

    // Validate referral code if provided
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (!referrer) {
        throw new AppError(
          400,
          "Invalid referral code",
          ErrorCodes.INVALID_REFERRAL_CODE,
        );
      }
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Generate unique referral code
    let newReferralCode = AuthUtils.generateReferralCode(firstName, lastName);

    // Ensure referral code is unique
    let codeExists = await prisma.user.findUnique({
      where: { referralCode: newReferralCode },
    });

    while (codeExists) {
      newReferralCode = AuthUtils.generateReferralCode(firstName, lastName);
      codeExists = await prisma.user.findUnique({
        where: { referralCode: newReferralCode },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        referralCode: newReferralCode,
        referredBy: referralCode || null,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        referralCode: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = AuthUtils.generateAccessToken(user.id);
    const refreshToken = AuthUtils.generateRefreshToken(user.id);

    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: AuthUtils.getRefreshTokenExpiry(),
      },
    });

    // Generate and save OTP
    const otp = AuthUtils.generateOTP();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationOtp: otp,
        emailVerificationExpiry: AuthUtils.getOTPExpiry(),
      },
    });

    // Send OTP email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        otp,
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Login user
   */
  async login(data: LoginInput) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(
        401,
        "Invalid email or password",
        ErrorCodes.INVALID_CREDENTIALS,
      );
    }

    // Check if account is active
    if (user.status === "BANNED") {
      throw new AppError(
        403,
        "Your account has been banned. Contact support.",
        ErrorCodes.ACCOUNT_BANNED,
      );
    }

    if (user.status === "SUSPENDED") {
      throw new AppError(
        403,
        "Your account is suspended. Contact support.",
        ErrorCodes.ACCOUNT_SUSPENDED,
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate new OTP
      const otp = AuthUtils.generateOTP();
      const expiry = AuthUtils.getOTPExpiry();

      // Save OTP to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationOtp: otp,
          emailVerificationExpiry: expiry,
        },
      });

      // Send verification email
      try {
        await this.emailService.sendVerificationEmail(
          user.email,
          user.firstName,
          otp,
        );
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }

      throw new AppError(
        403,
        "Please verify your email address before logging in. We've sent a new verification code to your email.",
        ErrorCodes.EMAIL_NOT_VERIFIED,
      );
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      throw new AppError(
        403,
        "Account is temporarily locked due to multiple failed login attempts. Try again later.",
        ErrorCodes.ACCOUNT_LOCKED,
      );
    }

    // Verify password
    const isPasswordValid = await AuthUtils.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: user.failedLoginAttempts + 1,
          accountLockedUntil:
            user.failedLoginAttempts + 1 >= 5
              ? new Date(Date.now() + 30 * 60 * 1000)
              : null,
        },
      });

      throw new AppError(
        401,
        "Invalid email or password",
        ErrorCodes.INVALID_CREDENTIALS,
      );
    }

    // Reset failed login attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Generate tokens
    const accessToken = AuthUtils.generateAccessToken(user.id);
    const refreshToken = AuthUtils.generateRefreshToken(user.id);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: AuthUtils.getRefreshTokenExpiry(),
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Logout user - revoke refresh token
   */
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Revoke specific refresh token (logout from this device)
      await prisma.refreshToken.updateMany({
        where: {
          userId,
          token: refreshToken,
          isActive: true,
        },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });
    } else {
      // Revoke all refresh tokens (logout from all devices)
      await prisma.refreshToken.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });
    }

    return {
      message: "Logged out successfully",
    };
  }

  /**
   * Logout from all devices - revoke all refresh tokens
   */
  async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    return {
      message: "Logged out from all devices successfully",
    };
  }

  /**
   * Send email verification OTP
   */
  async sendEmailVerificationOTP(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    if (user.emailVerified) {
      throw new AppError(
        400,
        "Email already verified",
        ErrorCodes.EMAIL_ALREADY_VERIFIED,
      );
    }

    // Generate OTP
    const otp = AuthUtils.generateOTP();
    const expiry = AuthUtils.getOTPExpiry();

    // Save OTP to database
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationOtp: otp,
        emailVerificationExpiry: expiry,
      },
    });

    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        otp,
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    return {
      message: "OTP sent to your email",
      email: user.email,
    };
  }

  /**
   * Verify email OTP
   */
  async verifyEmailOTP(email: string, otp: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    if (user.emailVerified) {
      throw new AppError(
        400,
        "Email already verified",
        ErrorCodes.EMAIL_ALREADY_VERIFIED,
      );
    }

    // Check if OTP exists
    if (!user.emailVerificationOtp) {
      throw new AppError(
        400,
        "No OTP found. Please request a new one.",
        ErrorCodes.OTP_NOT_FOUND,
      );
    }

    // Check if OTP is expired
    if (AuthUtils.isOTPExpired(user.emailVerificationExpiry)) {
      throw new AppError(
        400,
        "OTP has expired. Please request a new one.",
        ErrorCodes.OTP_EXPIRED,
      );
    }

    // Verify OTP
    if (user.emailVerificationOtp !== otp) {
      throw new AppError(400, "Invalid OTP", ErrorCodes.OTP_INVALID);
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationOtp: null,
        emailVerificationExpiry: null,
      },
    });

    return {
      message: "Email verified successfully",
    };
  }

  /**
   * Resend email verification OTP
   */
  async resendEmailVerificationOTP(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    if (user.emailVerified) {
      throw new AppError(
        400,
        "Email already verified",
        ErrorCodes.EMAIL_ALREADY_VERIFIED,
      );
    }

    return this.sendEmailVerificationOTP(user.id);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string) {
    // 1. Verify the refresh token is valid JWT
    let decoded;
    try {
      decoded = AuthUtils.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new AppError(
        401,
        "Invalid or expired refresh token",
        ErrorCodes.INVALID_REFRESH_TOKEN,
      );
    }

    // 2. Find the refresh token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError(
        401,
        "Refresh token not found",
        ErrorCodes.INVALID_REFRESH_TOKEN,
      );
    }

    // 3. Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      throw new AppError(
        401,
        "Refresh token has expired",
        ErrorCodes.REFRESH_TOKEN_EXPIRED,
      );
    }

    // 4. Check if token is revoked/inactive
    if (!storedToken.isActive || storedToken.revokedAt) {
      throw new AppError(
        401,
        "Refresh token has been revoked",
        ErrorCodes.REFRESH_TOKEN_REVOKED,
      );
    }

    // 5. Check if user still exists and is active
    if (!storedToken.user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    if (
      storedToken.user.status === "BANNED" ||
      storedToken.user.status === "SUSPENDED"
    ) {
      throw new AppError(
        403,
        "Account is not active",
        ErrorCodes.ACCOUNT_INACTIVE,
      );
    }

    // 6. Generate new tokens
    const newAccessToken = AuthUtils.generateAccessToken(storedToken.userId);
    const newRefreshToken = AuthUtils.generateRefreshToken(storedToken.userId);

    // 7. Revoke old refresh token and save new one (token rotation)
    await prisma.$transaction([
      // Revoke old token
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      }),
      // Create new token
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.userId,
          expiresAt: AuthUtils.getRefreshTokenExpiry(),
        },
      }),
    ]);

    // 8. Return new tokens
    return {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  /**
   * Request password reset - sends reset link to email
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return {
        message: "If an account exists with this email, a password reset link has been sent",
      };
    }

    // Check if account is active
    if (user.status === "BANNED" || user.status === "SUSPENDED") {
      return {
        message: "If an account exists with this email, a password reset link has been sent",
      };
    }

    // Generate reset token
    const resetToken = AuthUtils.generatePasswordResetToken();
    const resetExpiry = AuthUtils.getPasswordResetExpiry(); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      },
    });

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken,
      );
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      // Don't throw error - still return success for security
    }

    return {
      message: "If an account exists with this email, a password reset link has been sent",
    };
  }

  /**
   * Validate password reset token
   */
  async validateResetToken(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user) {
      throw new AppError(
        400,
        "Invalid or expired reset token",
        ErrorCodes.INVALID_RESET_TOKEN,
      );
    }

    // Check if token is expired
    if (!user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      throw new AppError(
        400,
        "Reset token has expired",
        ErrorCodes.RESET_TOKEN_EXPIRED,
      );
    }

    return {
      valid: true,
      email: user.email,
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user) {
      throw new AppError(
        400,
        "Invalid or expired reset token",
        ErrorCodes.INVALID_RESET_TOKEN,
      );
    }

    // Check if token is expired
    if (!user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      throw new AppError(
        400,
        "Reset token has expired",
        ErrorCodes.RESET_TOKEN_EXPIRED,
      );
    }

    // Hash new password
    const hashedPassword = await AuthUtils.hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
        passwordChangedAt: new Date(),
      },
    });

    // Invalidate all existing refresh tokens (logout from all devices)
    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    // Send password changed notification email
    try {
      await this.emailService.sendPasswordChangedEmail(
        user.email,
        user.firstName,
      );
    } catch (error) {
      console.error("Failed to send password changed email:", error);
    }

    return {
      message: "Password reset successfully",
    };
  }
}