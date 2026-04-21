import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyHostelAdmins } from "@/lib/notifications";

// Helper: verify OTP and mark as used
async function verifyAndUseOTP(email: string, code: string) {
  const otp = await prisma.oTP.findFirst({
    where: { email, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return null;
  await prisma.oTP.update({ where: { id: otp.id }, data: { used: true } });
  return otp;
}

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    // Use the helper to verify and consume the OTP
    const otp = await verifyAndUseOTP(email, code);
    if (!otp) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // ── Case 1: Admin registration flow ──
    // Check if there's a pending admin user with this email
    const pendingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (pendingAdmin && pendingAdmin.role === "ADMIN" && pendingAdmin.adminState === "PENDING") {
      // Email is verified — the admin's status stays PENDING (approval) but we mark them as ACTIVE
      // so they can see their "awaiting approval" message when they try to log in
      await prisma.user.update({
        where: { id: pendingAdmin.id },
        data: { status: "ACTIVE" },
      });

      // Notify existing admins of the hostel about the new admin applicant
      await notifyHostelAdmins(
        pendingAdmin.hostelId,
        "ADMIN_PROMOTED",
        "New Admin Registration Verified",
        `${pendingAdmin.name} has verified their email and is awaiting admin approval. Visit Admin Management to review.`,
        "/admin/admin-mgmt"
      );

      return NextResponse.json({
        success: true,
        message: "Email verified! Your admin registration is now pending approval from an existing hostel admin.",
        data: { flow: "admin" },
      });
    }

    // ── Case 2: Student application flow ──
    const application = await prisma.application.findUnique({
      where: { email },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "No pending registration found for this email" },
        { status: 404 }
      );
    }

    await prisma.application.update({
      where: { id: application.id },
      data: { emailVerified: true },
    });

    // Notify admins about the new student application
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
      data: { flow: "student" },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
