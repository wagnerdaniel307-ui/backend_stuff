// ============================================================================
// FILE: src/services/email.service.ts
// EMAIL SERVICE - Send emails via Resend
// ============================================================================

import { resend, emailConfig } from "../config/email";
import { emailVerificationTemplate } from "../emails/templates/email-verification";
import { loginAlertTemplate } from "../emails/templates/login-alert.template";
import { passwordChangedTemplate } from "../emails/templates/password-changed.template";
import { passwordResetTemplate } from "../emails/templates/reset-password.template";
import { welcomeTemplate } from "../emails/templates/welcome.template";


export class EmailService {
  /**
   * Send email verification OTP
   */
  async sendVerificationEmail(
    to: string,
    firstName: string,
    otp: string,
  ): Promise<void> {
    try {
      const template = emailVerificationTemplate({
        firstName,
        otp,
        expiryMinutes: 10,
      });

      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error) {
        console.error("Failed to send verification email:", error);
        throw new Error("Failed to send verification email");
      }

      console.log("✅ Verification email sent:", data?.id);
    } catch (error) {
      console.error("Email service error:", error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    try {
      const resetUrl = `${emailConfig.frontendUrl}/reset-password?token=${resetToken}`;
      
      const template = passwordResetTemplate({
        firstName,
        resetUrl,
        expiryMinutes: 60,
      });

      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error) {
        console.error("Failed to send password reset email:", error);
        throw new Error("Failed to send password reset email");
      }

      console.log("✅ Password reset email sent:", data?.id);
    } catch (error) {
      console.error("Email service error:", error);
      throw error;
    }
  }

  /**
   * Send password changed confirmation email
   */
  async sendPasswordChangedEmail(
    to: string,
    firstName: string,
  ): Promise<void> {
    try {
      const template = passwordChangedTemplate({
        firstName,
        supportEmail: emailConfig.supportEmail,
      });

      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error) {
        console.error("Failed to send password changed email:", error);
        throw new Error("Failed to send password changed email");
      }

      console.log("✅ Password changed email sent:", data?.id);
    } catch (error) {
      console.error("Email service error:", error);
      throw error;
    }
  }

  /**
   * Send welcome email (after verification)
   */
  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    try {
      const template = welcomeTemplate({
        firstName,
        dashboardUrl: `${emailConfig.frontendUrl}/dashboard`,
      });

      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error) {
        console.error("Failed to send welcome email:", error);
        throw new Error("Failed to send welcome email");
      }

      console.log("✅ Welcome email sent:", data?.id);
    } catch (error) {
      console.error("Email service error:", error);
      throw error;
    }
  }

  /**
   * Send login alert email
   */
  async sendLoginAlert(
    to: string,
    firstName: string,
    ipAddress: string,
    device: string,
    location?: string,
  ): Promise<void> {
    try {
      const template = loginAlertTemplate({
        firstName,
        ipAddress,
        device,
        location: location || "Unknown",
        timestamp: new Date().toLocaleString(),
        secureAccountUrl: `${emailConfig.frontendUrl}/settings/security`,
      });

      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error) {
        console.error("Failed to send login alert:", error);
        throw new Error("Failed to send login alert");
      }

      console.log("✅ Login alert sent:", data?.id);
    } catch (error) {
      console.error("Email service error:", error);
      throw error;
    }
  }

  /**
   * Send email change OTP
   */
  async sendEmailChangeOTP(
    to: string,
    firstName: string,
    otp: string,
  ): Promise<void> {
    try {
      const template = emailVerificationTemplate({
        firstName,
        otp,
        expiryMinutes: 15,
      });

      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to,
        subject: "Verify Your New Email Address",
        html: template.html,
        text: template.text,
      });

      if (error) {
        console.error("Failed to send email change OTP:", error);
        throw new Error("Failed to send email change OTP");
      }

      console.log("✅ Email change OTP sent:", data?.id);
    } catch (error) {
      console.error("Email service error:", error);
      throw error;
    }
  }
}