// ============================================================================
// FILE: src/emails/templates/email-verification.template.ts
// EMAIL VERIFICATION TEMPLATE
// ============================================================================

import { emailConfig } from "../../config/email";

interface EmailVerificationData {
  firstName: string;
  otp: string;
  expiryMinutes: number;
}

export const emailVerificationTemplate = (data: EmailVerificationData) => {
  const { firstName, otp, expiryMinutes } = data;

  return {
    subject: emailConfig.subjects.emailVerification,

    // HTML version
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
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
                Thank you for signing up! Please verify your email address using the code below:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                  Your Verification Code
                </p>
                <p style="color: #667eea; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </p>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                ⏱️ This code will expire in <strong>${expiryMinutes} minutes</strong>.
              </p>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                If you didn't create an account, you can safely ignore this email.
              </p>
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

Thank you for signing up with ${emailConfig.company.name}!

Your verification code is: ${otp}

This code will expire in ${expiryMinutes} minutes.

If you didn't create an account, you can safely ignore this email.

Need help? Contact us at ${emailConfig.company.supportEmail}

© ${new Date().getFullYear()} ${emailConfig.company.name}. All rights reserved.
    `.trim(),
  };
};
