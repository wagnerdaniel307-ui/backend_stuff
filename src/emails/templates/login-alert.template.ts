// ============================================================================
// FILE: src/emails/templates/login-alert.template.ts
// LOGIN ALERT TEMPLATE
// ============================================================================

import { emailConfig } from "../../config/email";

interface LoginAlertData {
  firstName: string;
  ipAddress: string;
  device: string;
  location: string;
  timestamp: string;
  secureAccountUrl: string;
}

export const loginAlertTemplate = (data: LoginAlertData) => {
  const { firstName, ipAddress, device, location, timestamp, secureAccountUrl } = data;

  return {
    subject: emailConfig.subjects.loginAlert,

    // HTML version
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Login Detected</title>
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
                <span style="font-size: 60px;">🔐</span>
              </div>
              
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                New Login Detected
              </h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${firstName},
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We detected a new login to your account. If this was you, you can ignore this email. If not, please secure your account immediately.
              </p>
              
              <!-- Login Details -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">
                  Login Details
                </h3>
                
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #999999; font-size: 14px; padding: 8px 0;">
                      <strong>Time:</strong>
                    </td>
                    <td style="color: #333333; font-size: 14px; padding: 8px 0; text-align: right;">
                      ${timestamp}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #999999; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                      <strong>Device:</strong>
                    </td>
                    <td style="color: #333333; font-size: 14px; padding: 8px 0; text-align: right; border-top: 1px solid #e0e0e0;">
                      ${device}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #999999; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                      <strong>Location:</strong>
                    </td>
                    <td style="color: #333333; font-size: 14px; padding: 8px 0; text-align: right; border-top: 1px solid #e0e0e0;">
                      ${location}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #999999; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                      <strong>IP Address:</strong>
                    </td>
                    <td style="color: #333333; font-size: 14px; padding: 8px 0; text-align: right; border-top: 1px solid #e0e0e0;">
                      ${ipAddress}
                    </td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ Was this you?</strong><br>
                  If you don't recognize this login, please secure your account immediately by changing your password and reviewing your account activity.
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${secureAccountUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  Secure My Account
                </a>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0; text-align: center;">
                If you have any concerns, please contact our support team immediately.
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
New Login Detected

Hi ${firstName},

We detected a new login to your account. If this was you, you can ignore this email. If not, please secure your account immediately.

LOGIN DETAILS:
Time: ${timestamp}
Device: ${device}
Location: ${location}
IP Address: ${ipAddress}

WAS THIS YOU?
If you don't recognize this login, please secure your account immediately by changing your password and reviewing your account activity.

Secure your account: ${secureAccountUrl}

If you have any concerns, please contact our support team immediately at ${emailConfig.company.supportEmail}

© ${new Date().getFullYear()} ${emailConfig.company.name}. All rights reserved.
    `.trim(),
  };
};