const nodemailer = require('nodemailer');

/**
 * Create a reusable transporter from SMTP env vars.
 * Requires: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

/**
 * Send OTP verification email with branded dark-theme HTML.
 * @param {string} toEmail - recipient email
 * @param {string} otp - plain 6-digit OTP (never stored, transient)
 * @param {string} maskedEmail - e.g. m***@gmail.com for display
 */
const sendOTPEmail = async (toEmail, otp, maskedEmail) => {
    const transporter = createTransporter();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your MentorConnect OTP</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0f0f1a; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrapper { max-width: 520px; margin: 0 auto; padding: 40px 20px; }
  .card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 24px;
    border: 1px solid rgba(139, 92, 246, 0.2);
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(139, 92, 246, 0.15);
  }
  .header {
    background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
    padding: 40px 40px 32px;
    text-align: center;
  }
  .logo {
    font-size: 26px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }
  .logo-dot { color: #a78bfa; }
  .tagline { color: rgba(255,255,255,0.7); font-size: 13px; }
  .body { padding: 40px; }
  h2 { color: #f1f5f9; font-size: 22px; font-weight: 700; margin-bottom: 8px; }
  .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 32px; line-height: 1.6; }
  .otp-container { background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 28px; }
  .otp-label { color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
  .otp-code {
    font-size: 48px;
    font-weight: 900;
    letter-spacing: 12px;
    color: #a78bfa;
    font-family: 'Courier New', monospace;
    text-shadow: 0 0 30px rgba(167, 139, 250, 0.5);
  }
  .expiry { color: #f59e0b; font-size: 13px; font-weight: 600; margin-top: 12px; }
  .info-box { background: rgba(30, 41, 59, 0.6); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
  .info-box p { color: #cbd5e1; font-size: 13px; line-height: 1.7; }
  .warning { color: #ef4444; font-weight: 700; display: block; margin-top: 6px; }
  .footer { text-align: center; padding: 24px 40px 32px; border-top: 1px solid rgba(255,255,255,0.05); }
  .footer p { color: #475569; font-size: 12px; line-height: 1.6; }
  .footer a { color: #7c3aed; text-decoration: none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="logo">Mentor<span class="logo-dot">Connect</span></div>
      <div class="tagline">Empowering careers through expert mentorship</div>
    </div>
    <div class="body">
      <h2>Verify your email address</h2>
      <p class="subtitle">We sent a verification code to <strong style="color:#a78bfa">${maskedEmail}</strong>. Enter this code to complete your registration.</p>
      <div class="otp-container">
        <div class="otp-label">Your One-Time Password</div>
        <div class="otp-code">${otp}</div>
        <div class="expiry">⏱ Expires in 10 minutes</div>
      </div>
      <div class="info-box">
        <p>
          If you did not request this code, you can safely ignore this email. Your account will not be created.
          <span class="warning">🔒 Never share this OTP with anyone. MentorConnect will never ask for it.</span>
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} MentorConnect. All rights reserved.<br/>
      <a href="mailto:support@mentorconnect.com">support@mentorconnect.com</a></p>
    </div>
  </div>
</div>
</body>
</html>`;

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Mentor Connect'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `${otp} — Your MentorConnect Verification Code`,
        html,
        text: `Your MentorConnect OTP is: ${otp}\n\nThis code expires in 10 minutes.\n\nNever share this OTP with anyone.`,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
};

module.exports = { sendOTPEmail };
