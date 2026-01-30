// ============================================================================
// FILE: src/emails/templates/welcome.template.ts
// WELCOME EMAIL TEMPLATE
// ============================================================================

import { emailConfig } from "../../config/email";

interface WelcomeData {
  firstName: string;
  dashboardUrl: string;
}

export const welcomeTemplate = (data: WelcomeData) => {
  const { firstName, dashboardUrl } = data;

  return {
    subject: emailConfig.subjects.welcomeEmail,

    // HTML version
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${emailConfig.company.name}</title>
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
                <span style="font-size: 60px;">🎉</span>
              </div>
              
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 28px; text-align: center;">
                Welcome to ${emailConfig.company.name}!
              </h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi ${firstName},
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining us! Your email has been verified and your account is now active. We're excited to have you on board! 🚀
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Here's what you can do next:
              </p>
              
              <!-- Features List -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                    <p style="margin: 0; color: #333333; font-size: 16px;">
                      <strong>📱 Manage Your Bills</strong><br>
                      <span style="color: #666666; font-size: 14px;">Pay your bills easily and securely</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 8px; margin: 10px 0;">
                    <p style="margin: 0; color: #333333; font-size: 16px;">
                      <strong>💳 Quick Transactions</strong><br>
                      <span style="color: #666666; font-size: 14px;">Fast and reliable payment processing</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 8px; margin-top: 10px;">
                    <p style="margin: 0; color: #333333; font-size: 16px;">
                      <strong>📊 Track Your History</strong><br>
                      <span style="color: #666666; font-size: 14px;">View all your transactions in one place</span>
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0 30px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0; text-align: center;">
                If you have any questions, our support team is here to help!
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
Welcome to ${emailConfig.company.name}!

Hi ${firstName},

Thank you for joining us! Your email has been verified and your account is now active. We're excited to have you on board!

Here's what you can do next:

📱 MANAGE YOUR BILLS
Pay your bills easily and securely

💳 QUICK TRANSACTIONS
Fast and reliable payment processing

📊 TRACK YOUR HISTORY
View all your transactions in one place

Get started now: ${dashboardUrl}

If you have any questions, our support team is here to help!

Need help? Contact us at ${emailConfig.company.supportEmail}

© ${new Date().getFullYear()} ${emailConfig.company.name}. All rights reserved.
    `.trim(),
  };
};