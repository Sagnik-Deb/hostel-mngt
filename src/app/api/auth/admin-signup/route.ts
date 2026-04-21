import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import { generateOTP } from "@/lib/utils";
import { notifyHostelAdmins } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, hostelId } = body;

    // Validate required fields
    if (!email || !password || !name || !hostelId) {
      return NextResponse.json(
        { success: false, error: "Email, password, name, and hostel are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists in users table
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check if there is already a pending application with this email (student flow)
    const existingApp = await prisma.application.findUnique({ where: { email } });
    if (existingApp) {
      return NextResponse.json(
        { success: false, error: "An application with this email is already pending" },
        { status: 409 }
      );
    }

    // Validate hostel exists
    const hostel = await prisma.hostel.findUnique({ where: { id: hostelId } });
    if (!hostel) {
      return NextResponse.json(
        { success: false, error: "Invalid hostel selected" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user directly with ADMIN role and PENDING approval state
    // They won't be able to log in until an existing admin approves them
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        hostelId,
        role: "ADMIN",
        status: "PENDING_APPROVAL",
        adminState: "PENDING",
      },
    });

    // Generate OTP for email verification
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oTP.create({
      data: { email, code: otp, expiresAt },
    });

    // Try to send OTP email (non-fatal if it fails)
    try {
      await sendOTPEmail(email, otp);
    } catch (emailErr) {
      console.error("OTP email failed (non-fatal):", emailErr);
    }

    // Notify existing approved admins of the hostel about the new admin candidate
    await notifyHostelAdmins(
      hostelId,
      "ADMIN_PROMOTED",
      "New Admin Registration",
      `${name} has registered as an admin for your hostel and is awaiting approval. Go to Admin Management to review.`,
      "/admin/admin-mgmt"
    );

    return NextResponse.json(
      {
        success: true,
        message: "Admin registration submitted. Please verify your email, then wait for admin approval.",
        data: { userId: newAdmin.id, email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin signup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
