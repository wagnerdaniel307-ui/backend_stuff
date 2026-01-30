// ============================================================================
// FILE: src/config/email.ts
// EMAIL CONFIGURATION - Resend setup
// ============================================================================

import { Resend } from "resend";
import { env } from "./env";

// Initialize Resend
export const resend = new Resend(env.RESEND_API_KEY);

// Email configuration
export const emailConfig = {
  from: env.EMAIL_FROM || "onboarding@resend.dev", // Update with your domain
  replyTo: env.EMAIL_REPLY_TO || "support@gracebills.com",
  
  // Frontend URLs
  frontendUrl: env.FRONTEND_URL || "http://localhost:3000",
  
  // Support contact
  supportEmail: env.SUPPORT_EMAIL || "support@gracebills.com",

  // Email subjects
  subjects: {
    emailVerification: "Verify Your Email - GraceBills",
    passwordReset: "Reset Your Password - GraceBills",
    passwordChanged: "Password Changed Successfully - GraceBills",
    welcomeEmail: "Welcome to GraceBills!",
    loginAlert: "New Login Detected - GraceBills",
  },

  // Company info
  company: {
    name: "GraceBills",
    website: "https://gracebills.com",
    supportEmail: "support@gracebills.com",
    address: "Your Company Address", // Optional: for email footers
  },

  // Email expiry times (for display in templates)
  expiry: {
    otp: 10, // minutes
    passwordReset: 60, // minutes (1 hour)
  },
};