// ============================================================================
// FILE: src/modules/auth/auth.validation.ts
// AUTH VALIDATION SCHEMAS - Zod Edition
// ============================================================================

import { z } from "zod";

// ============================================================================
// REGEX PATTERNS
// ============================================================================

/**
 * Nigerian phone number pattern
 * Accepts: +2348012345678 or 08012345678
 */
const nigerianPhoneRegex = /^\+234[0-9]{10}$/;
const localPhoneRegex = /^0[0-9]{10}$/;

/**
 * Password strength pattern
 * Must contain: uppercase, lowercase, number, special char
 */
const passwordPattern = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

// ============================================================================
// REUSABLE FIELD SCHEMAS
// ============================================================================

const emailSchema = z
  .string({
    error: "Email is required",
  })
  .email("Please provide a valid email address")
  .toLowerCase()
  .trim();

const phoneSchema = z
  .string({
   error: "Phone number is required",
  })
  .regex(
    nigerianPhoneRegex,
    "Phone must be in format: +2348012345678",
  )
  .or(
    z
      .string()
      .regex(localPhoneRegex, "Invalid phone number format")
      .transform((val) => `+234${val.substring(1)}`),
  );

const passwordSchema = z
  .string({
    error: "Password is required",
  })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(passwordPattern.uppercase, "Password must contain at least one uppercase letter")
  .regex(passwordPattern.lowercase, "Password must contain at least one lowercase letter")
  .regex(passwordPattern.number, "Password must contain at least one number")
  .regex(passwordPattern.special, "Password must contain at least one special character");

const nameSchema = (fieldName: string) =>
  z
    .string({
      error: `${fieldName} is required`,
    })
    .min(2, `${fieldName} must be at least 2 characters`)
    .max(50, `${fieldName} must not exceed 50 characters`)
    .trim();

const otpSchema = z
  .string({
    error: "OTP is required",
  })
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only numbers");

const tokenSchema = z
  .string({
    error: "Token is required",
  })
  .min(1, "Token cannot be empty");

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const authValidation = {
  /**
   * User registration validation
   * @route POST /auth/register
   */
  register: z.object({
    body: z.object({
      email: emailSchema,
      phone: phoneSchema,
      password: passwordSchema,
      firstName: nameSchema("First name"),
      lastName: nameSchema("Last name"),
      referralCode: z.string().optional(),
    }),
  }),

  /**
   * User login validation
   * @route POST /auth/login
   */
  login: z.object({
    body: z.object({
      email: emailSchema,
      password: z.string().min(1, "Password is required"),
    }),
  }),

  /**
   * Refresh token validation
   * @route POST /auth/refresh-token
   */
  refreshToken: z.object({
    body: z.object({
      refreshToken: z.string().min(1, "Refresh token is required"),
    }),
  }),

  /**
   * Email verification with OTP
   * @route POST /auth/verify-email
   */
  verifyEmail: z.object({
    body: z.object({
      email: emailSchema,
      otp: otpSchema,
    }),
  }),

  /**
   * Resend email verification OTP
   * @route POST /auth/resend-email-otp
   */
  resendEmailOTP: z.object({
    body: z.object({
      email: emailSchema,
    }),
  }),

  /**
   * Forgot password request
   * @route POST /auth/forgot-password
   */
  forgotPassword: z.object({
    body: z.object({
      email: emailSchema,
    }),
  }),

  /**
   * Validate password reset token
   * @route POST /auth/validate-reset-token
   */
  validateResetToken: z.object({
    body: z.object({
      token: tokenSchema,
    }),
  }),

  /**
   * Reset password with token
   * @route POST /auth/reset-password
   */
  resetPassword: z.object({
    body: z
      .object({
        token: tokenSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, "Password confirmation is required"),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }),
  }),

  /**
   * Change password (authenticated users)
   * @route POST /auth/change-password
   */
  changePassword: z.object({
    body: z
      .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, "Password confirmation is required"),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
      .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
      }),
  }),

  /**
   * Update profile validation
   * @route PATCH /auth/profile
   */
  updateProfile: z.object({
    body: z.object({
      firstName: nameSchema("First name").optional(),
      lastName: nameSchema("Last name").optional(),
      middleName: z.string().max(50).trim().optional(),
      dateOfBirth: z
        .string()
        .datetime()
        .or(z.date())
        .optional(),
      gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
      address: z.string().max(200).trim().optional(),
      city: z.string().max(50).trim().optional(),
      state: z.string().max(50).trim().optional(),
    }),
  }),

  /**
   * Enable/Disable 2FA validation
   * @route POST /auth/2fa/enable
   */
  toggle2FA: z.object({
    body: z.object({
      enabled: z.boolean({
        error: "Enabled status is required",
      }),
      password: z.string().min(1, "Password is required for this action"),
    }),
  }),

  /**
   * Verify 2FA code
   * @route POST /auth/2fa/verify
   */
  verify2FA: z.object({
    body: z.object({
      code: z
        .string()
        .length(6, "2FA code must be 6 digits")
        .regex(/^\d{6}$/, "2FA code must contain only numbers"),
    }),
  }),
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RegisterInput = z.infer<typeof authValidation.register>["body"];
export type LoginInput = z.infer<typeof authValidation.login>["body"];
export type RefreshTokenInput = z.infer<typeof authValidation.refreshToken>["body"];
export type VerifyEmailInput = z.infer<typeof authValidation.verifyEmail>["body"];
export type ResendEmailOTPInput = z.infer<typeof authValidation.resendEmailOTP>["body"];
export type ForgotPasswordInput = z.infer<typeof authValidation.forgotPassword>["body"];
export type ValidateResetTokenInput = z.infer<typeof authValidation.validateResetToken>["body"];
export type ResetPasswordInput = z.infer<typeof authValidation.resetPassword>["body"];
export type ChangePasswordInput = z.infer<typeof authValidation.changePassword>["body"];
export type UpdateProfileInput = z.infer<typeof authValidation.updateProfile>["body"];
export type Toggle2FAInput = z.infer<typeof authValidation.toggle2FA>["body"];
export type Verify2FAInput = z.infer<typeof authValidation.verify2FA>["body"];