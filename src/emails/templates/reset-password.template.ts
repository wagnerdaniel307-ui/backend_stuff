// ============================================================================
// FILE: src/emails/templates/password-reset.template.ts
// PASSWORD RESET TEMPLATE
// ============================================================================

import { emailConfig } from "../../config/email";

interface PasswordResetData {
  firstName: string;
  resetUrl: string;
  expiryMinutes: number;
}

export const passwordResetTemplate = (data: PasswordResetData) => {
  const { firstName, resetUrl, expiryMinutes } = data;

  return {
    subject: emailConfig.subjects.passwordReset,

    // HTML version
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                ${emailConfig.company.name}
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                Hi ${firstName}! 👋
              </h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- Reset Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 4px; padding: 12px; word-break: break-all; font-size: 12px; color: #667eea; margin: 10px 0 20px 0;">
                ${resetUrl}
              </p>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                ⏱️ This link will expire in <strong>${expiryMinutes} minutes</strong>.
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ Security Note:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure. Your password will not be changed.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0;">
                Need help? Contact us at 
                <a href="mailto:${emailConfig.company.supportEmail}" style="color: #667eea; text-decoration: none;">
                  ${emailConfig.company.supportEmail}
                </a>
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ${emailConfig.company.name}. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,

    // Plain text version (fallback)
    text: `
Hi ${firstName}!

We received a request to reset your password for your ${emailConfig.company.name} account.

Reset your password by visiting this link:
${resetUrl}

This link will expire in ${expiryMinutes} minutes.

If you didn't request a password reset, please ignore this email and ensure your account is secure. Your password will not be changed.

Need help? Contact us at ${emailConfig.company.supportEmail}

© ${new Date().getFullYear()} ${emailConfig.company.name}. All rights reserved.
    `.trim(),
  };
};