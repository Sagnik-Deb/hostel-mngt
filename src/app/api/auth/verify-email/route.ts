import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyHostelAdmins } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    // Find latest unused OTP for this email
    const otp = await prisma.oTP.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Update application
    const application = await prisma.application.findUnique({
      where: { email },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    await prisma.application.update({
      where: { id: application.id },
      data: { emailVerified: true },
    });

    // Notify admins about the new application
    await notifyHostelAdmins(
      application.hostelId,
      "STUDENT_REGISTERED",
      "New Application Received",
      `A new application from ${application.name} has been verified and is pending approval.`,
      "/admin/applications"
    );

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. Your application is now pending admin approval.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
