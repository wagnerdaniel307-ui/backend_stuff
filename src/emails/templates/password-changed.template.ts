// ============================================================================
// FILE: src/emails/templates/password-changed.template.ts
// PASSWORD CHANGED CONFIRMATION TEMPLATE
// ============================================================================

import { emailConfig } from "../../config/email";

interface PasswordChangedData {
  firstName: string;
  supportEmail: string;
}

export const passwordChangedTemplate = (data: PasswordChangedData) => {
  const { firstName, supportEmail } = data;

  return {
    subject: emailConfig.subjects.passwordChanged,

    // HTML version
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed Successfully</title>
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
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="background-color: #d4edda; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
                  <span style="font-size: 40px;">✓</span>
                </div>
              </div>
              
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                Password Changed Successfully
              </h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${firstName},
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your password has been successfully changed. You can now log in with your new password.
              </p>
              
              <div style="background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #0c5460; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>🔒 Security Information:</strong> For your security, you have been logged out of all devices. You'll need to log in again with your new password.
                </p>
              </div>
              
              <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #721c24; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ Didn't make this change?</strong><br>
                  If you did not change your password, please contact our support team immediately at 
                  <a href="mailto:${supportEmail}" style="color: #721c24; font-weight: bold;">
                    ${supportEmail}
                  </a>
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
Hi ${firstName},

Your password has been successfully changed. You can now log in with your new password.

SECURITY INFORMATION:
For your security, you have been logged out of all devices. You'll need to log in again with your new password.

DIDN'T MAKE THIS CHANGE?
If you did not change your password, please contact our support team immediately at ${supportEmail}

Need help? Contact us at ${emailConfig.company.supportEmail}

© ${new Date().getFullYear()} ${emailConfig.company.name}. All rights reserved.
    `.trim(),
  };
};