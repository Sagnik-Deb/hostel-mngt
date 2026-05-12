import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Check if user exists (don't reveal if they don't)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Invalidate any previous unused tokens for this email
      await prisma.passwordResetToken.updateMany({
        where: { email, used: false },
        data: { used: true },
      });

      // Generate a secure random token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await prisma.passwordResetToken.create({
        data: { email, token, expiresAt },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

      await sendEmail({
        to: email,
        subject: "Reset Your Password — Assam University Hostel",
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); border-radius: 16px; padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0 0 8px; font-size: 24px;">🔐 Password Reset</h1>
              <p style="margin: 0; opacity: 0.9; font-size: 14px;">Assam University Hostel Management</p>
            </div>
            <div style="padding: 32px 20px; text-align: center;">
              <p style="color: #374151; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
              <p style="color: #6b7280; font-size: 14px;">We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>30 minutes</strong>.</p>
              <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">Reset My Password</a>
              <p style="color: #9ca3af; font-size: 12px;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #d1d5db; font-size: 11px;">If the button doesn't work, copy this link:<br/><span style="color: #6b7280;">${resetUrl}</span></p>
            </div>
          </div>
        `,
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
