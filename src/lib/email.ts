import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[EMAIL SKIPPED] No SMTP configured. Would send to: ${to}, Subject: ${subject}`);
      return { success: true, skipped: true };
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "Hostel Management <noreply@hostelmgmt.com>",
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

export async function sendOTPEmail(email: string, otp: string) {
  return sendEmail({
    to: email,
    subject: "Email Verification - Hostel Management System",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0 0 10px;">🏠 Hostel Management</h1>
          <p style="margin: 0; opacity: 0.9;">Email Verification</p>
        </div>
        <div style="padding: 30px 20px; text-align: center;">
          <p style="color: #555; font-size: 16px;">Your verification code is:</p>
          <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      </div>
    `,
  });
}

export async function sendLeaveReminderEmail(
  email: string,
  name: string,
  endDate: string
) {
  return sendEmail({
    to: email,
    subject: "Leave Reminder - Return Due Tomorrow",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 16px; padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0 0 10px;">⏰ Leave Reminder</h1>
          <p style="margin: 0; opacity: 0.9;">Your return is due tomorrow</p>
        </div>
        <div style="padding: 30px 20px;">
          <p style="color: #555; font-size: 16px;">Hello <strong>${name}</strong>,</p>
          <p style="color: #555;">Your leave ends on <strong>${endDate}</strong>. Please ensure you return to your hostel by this date.</p>
          <p style="color: #888; font-size: 14px;">If you need an extension, please request one from your dashboard before your return date.</p>
        </div>
      </div>
    `,
  });
}

export async function sendNotificationEmail(
  email: string,
  title: string,
  message: string
) {
  return sendEmail({
    to: email,
    subject: `${title} - Hostel Management`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 16px; padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0 0 10px;">🔔 ${title}</h1>
        </div>
        <div style="padding: 30px 20px;">
          <p style="color: #555; font-size: 16px;">${message}</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open Dashboard</a>
          </div>
        </div>
      </div>
    `,
  });
}
