// ============================================================================
// FILE: src/modules/users/user.service.ts
// USER SERVICE - Business logic for user profile management
// ============================================================================

import { prisma } from "../../config/database";
import { AppError } from "../../middleware/error.middleware";
import { EmailService } from "../../services/email-services";
import { AuthUtils } from "../auth/auth.utils";
import { CloudinaryService } from "../../services/cloudinary.service";
import { ErrorCodes } from "../../constants/error-codes";
import type {
  UpdateBasicProfileInput,
  RequestEmailChangeInput,
  RequestPhoneChangeInput,
  ChangePasswordInput,
  UpdateAvatarInput,
} from "./user.validation";

export class UserService {
  private emailService: EmailService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.emailService = new EmailService();
    this.cloudinaryService = new CloudinaryService();
  }

  /**
   * Get user profile (excluding password)
   */
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        firstName: true,
        lastName: true,
        middleName: true,
        dateOfBirth: true,
        gender: true,
        bvn: true,
        address: true,
        city: true,
        state: true,
        country: true,
        role: true,
        status: true,
        emailVerified: true,
        emailVerifiedAt: true,
        phoneVerified: true,
        phoneVerifiedAt: true,
        twoFactorEnabled: true,
        avatarUrl: true,
        avatarThumbnail: true,
        lastLoginAt: true,
        referralCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Update basic profile information (non-sensitive fields)
   */
  async updateBasicProfile(userId: string, data: UpdateBasicProfileInput) {
    // Validate user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    // If username is being updated, check if it's already taken
    if (data.username && data.username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (usernameExists) {
        throw new AppError(
          400,
          "Username is already taken",
          ErrorCodes.VALIDATION_ERROR
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
        firstName: true,
        lastName: true,
        middleName: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        country: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Request email change - sends OTP to new email
   * Email won't be changed until OTP is verified
   */
  async requestEmailChange(userId: string, data: RequestEmailChangeInput) {
    const { newEmail, password } = data;

    // Get user with password for verification
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    // Verify password
    const isPasswordValid = await AuthUtils.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppError(
        401,
        "Invalid password",
        ErrorCodes.INVALID_CREDENTIALS,
      );
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new AppError(
        400,
        "Email is already in use by another account",
        ErrorCodes.EMAIL_ALREADY_EXISTS,
      );
    }

    // Don't allow changing to same email
    if (user.email === newEmail) {
      throw new AppError(
        400,
        "New email must be different from current email",
        ErrorCodes.VALIDATION_ERROR,
      );
    }

    // Generate OTP
    const otp = AuthUtils.generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store new email and OTP in user record temporarily
    // We'll use emailVerificationOtp field for this purpose
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Store the new email in a temporary field (we'll need to add this or use a workaround)
        // For now, we'll store it in emailVerificationOtp as "EMAIL_CHANGE:newemail@example.com:123456"
        emailVerificationOtp: `EMAIL_CHANGE:${newEmail}:${otp}`,
        emailVerificationExpiry: otpExpiry,
      },
    });

    // Send OTP to new email
    await this.emailService.sendEmailChangeOTP(
      newEmail,
      `${user.firstName} ${user.lastName}`,
      otp,
    );

    return {
      message: "Verification OTP sent to new email address",
      expiresAt: otpExpiry,
    };
  }

  /**
   * Verify email change with OTP
   */
  async verifyEmailChange(userId: string, otp: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    // Check if there's a pending email change
    if (
      !user.emailVerificationOtp ||
      !user.emailVerificationOtp.startsWith("EMAIL_CHANGE:")
    ) {
      throw new AppError(
        400,
        "No pending email change request",
        ErrorCodes.VALIDATION_ERROR,
      );
    }

    // Parse stored data: "EMAIL_CHANGE:newemail@example.com:123456"
    const [, newEmail, storedOtp] = user.emailVerificationOtp.split(":");

    // Verify OTP hasn't expired
    if (
      !user.emailVerificationExpiry ||
      new Date() > user.emailVerificationExpiry
    ) {
      throw new AppError(
        400,
        "OTP has expired. Please request a new one",
        ErrorCodes.OTP_EXPIRED,
      );
    }

    // Verify OTP matches
    if (otp !== storedOtp) {
      throw new AppError(400, "Invalid OTP", ErrorCodes.OTP_INVALID);
    }

    // Update email and clear verification fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationOtp: null,
        emailVerificationExpiry: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        phoneVerified: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Request phone change - sends OTP to new phone
   * Phone won't be changed until OTP is verified
   */
  async requestPhoneChange(userId: string, data: RequestPhoneChangeInput) {
    const { newPhone, password } = data;

    // Get user with password for verification
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    // Verify password
    const isPasswordValid = await AuthUtils.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppError(
        401,
        "Invalid password",
        ErrorCodes.INVALID_CREDENTIALS,
      );
    }

    // Check if new phone is already in use
    const existingUser = await prisma.user.findUnique({
      where: { phone: newPhone },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new AppError(
        400,
        "Phone number is already in use by another account",
        ErrorCodes.PHONE_ALREADY_EXISTS,
      );
    }

    // Don't allow changing to same phone
    if (user.phone === newPhone) {
      throw new AppError(
        400,
        "New phone must be different from current phone",
        ErrorCodes.VALIDATION_ERROR,
      );
    }

    // Generate OTP
    const otp = AuthUtils.generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store new phone and OTP temporarily
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerificationOtp: `PHONE_CHANGE:${newPhone}:${otp}`,
        phoneVerificationExpiry: otpExpiry,
      },
    });

    // TODO: Send OTP via SMS service (not implemented yet)
    // For now, we'll just return the OTP in development
    console.log(`📱 Phone Change OTP for ${newPhone}: ${otp}`);

    return {
      message: "Verification OTP sent to new phone number",
      expiresAt: otpExpiry,
      // In development, return OTP (remove in production)
      ...(process.env.NODE_ENV !== "production" && { otp }),
    };
  }

  /**
   * Verify phone change with OTP
   */
  async verifyPhoneChange(userId: string, otp: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    // Check if there's a pending phone change
    if (
      !user.phoneVerificationOtp ||
      !user.phoneVerificationOtp.startsWith("PHONE_CHANGE:")
    ) {
      throw new AppError(
        400,
        "No pending phone change request",
        ErrorCodes.VALIDATION_ERROR,
      );
    }

    // Parse stored data: "PHONE_CHANGE:+2348012345678:123456"
    const [, newPhone, storedOtp] = user.phoneVerificationOtp.split(":");

    // Verify OTP hasn't expired
    if (
      !user.phoneVerificationExpiry ||
      new Date() > user.phoneVerificationExpiry
    ) {
      throw new AppError(
        400,
        "OTP has expired. Please request a new one",
        ErrorCodes.OTP_EXPIRED,
      );
    }

    // Verify OTP matches
    if (otp !== storedOtp) {
      throw new AppError(400, "Invalid OTP", ErrorCodes.OTP_INVALID);
    }

    // Update phone and clear verification fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: newPhone,
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        phoneVerificationOtp: null,
        phoneVerificationExpiry: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        phoneVerified: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, data: ChangePasswordInput) {
    const { currentPassword, newPassword } = data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found", ErrorCodes.USER_NOT_FOUND);
    }

    // Verify current password
    const isPasswordValid = await AuthUtils.comparePassword(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppError(
        401,
        "Current password is incorrect",
        ErrorCodes.INVALID_CREDENTIALS,
      );
    }

    // Hash new password
    const hashedPassword = await AuthUtils.hashPassword(newPassword);

    // Update password and invalidate all refresh tokens (logout from all devices)
    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      // Invalidate all refresh tokens
      prisma.refreshToken.updateMany({
        where: { userId },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      }),
    ]);

    return {
      message: "Password changed successfully. You have been logged out from all devices.",
    };
  }

  /**
   * Update avatar - uploads to Cloudinary
   */
  async updateAvatar(userId: string, fileBuffer: Buffer) {
    // 1. Upload to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImage(fileBuffer);

    // 2. Update database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: uploadResult.secure_url,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        avatarUrl: true,
        avatarThumbnail: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}
