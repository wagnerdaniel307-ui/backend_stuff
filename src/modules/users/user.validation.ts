// ============================================================================
// FILE: src/modules/users/user.validation.ts
// USER VALIDATION SCHEMAS - Zod Edition
// ============================================================================

import { z } from "zod";

// ============================================================================
// REGEX PATTERNS (Imported from auth patterns)
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

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const userValidation = {
  /**
   * Update basic profile information
   * @route PATCH /users/profile
   */
  updateBasicProfile: z.object({
    body: z.object({
      username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must not exceed 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .trim()
        .toLowerCase()
        .optional(),
      firstName: nameSchema("First name").optional(),
      lastName: nameSchema("Last name").optional(),
      middleName: z.string().max(50).trim().optional(),
      dateOfBirth: z
        .string()
        .datetime()
        .or(z.date())
        .optional(),
      gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
      bvn: z
        .string()
        .length(11, "BVN must be exactly 11 digits")
        .regex(/^\d{11}$/, "BVN must contain only numbers")
        .optional(),
      address: z.string().max(200).trim().optional(),
      city: z.string().max(50).trim().optional(),
      state: z.string().max(50).trim().optional(),
    }),
  }),

  /**
   * Request email change (requires password for security)
   * @route POST /users/email/request-change
   */
  requestEmailChange: z.object({
    body: z.object({
      newEmail: emailSchema,
      password: z.string().min(1, "Password is required for this action"),
    }),
  }),

  /**
   * Verify email change with OTP
   * @route POST /users/email/verify-change
   */
  verifyEmailChange: z.object({
    body: z.object({
      otp: otpSchema,
    }),
  }),

  /**
   * Request phone change (requires password for security)
   * @route POST /users/phone/request-change
   */
  requestPhoneChange: z.object({
    body: z.object({
      newPhone: phoneSchema,
      password: z.string().min(1, "Password is required for this action"),
    }),
  }),

  /**
   * Verify phone change with OTP
   * @route POST /users/phone/verify-change
   */
  verifyPhoneChange: z.object({
    body: z.object({
      otp: otpSchema,
    }),
  }),

  /**
   * Change password (authenticated users)
   * @route POST /users/change-password
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
   * Update avatar URL
   * @route PATCH /users/avatar
   */
  updateAvatar: z.object({
    body: z.object({
      avatarUrl: z.string().url("Please provide a valid URL").optional(),
    }),
  }),
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UpdateBasicProfileInput = z.infer<typeof userValidation.updateBasicProfile>["body"];
export type RequestEmailChangeInput = z.infer<typeof userValidation.requestEmailChange>["body"];
export type VerifyEmailChangeInput = z.infer<typeof userValidation.verifyEmailChange>["body"];
export type RequestPhoneChangeInput = z.infer<typeof userValidation.requestPhoneChange>["body"];
export type VerifyPhoneChangeInput = z.infer<typeof userValidation.verifyPhoneChange>["body"];
export type ChangePasswordInput = z.infer<typeof userValidation.changePassword>["body"];
export type UpdateAvatarInput = z.infer<typeof userValidation.updateAvatar>["body"];
