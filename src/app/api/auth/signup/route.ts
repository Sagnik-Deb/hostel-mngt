import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import { generateOTP } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      phone,
      aadharNumber,
      collegeIdUpload,
      allotmentCertificate,
      hostelId,
      roommatePreference,
      roommateQuestionnaire,
    } = body;

    // Validate required fields
    if (!email || !password || !name || !hostelId) {
      return NextResponse.json(
        { success: false, error: "Email, password, name, and hostel are required" },
        { status: 400 }
      );
    }

    // Check if email already exists in users
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Check if application already exists
    const existingApp = await prisma.application.findUnique({
      where: { email },
    });

    if (existingApp) {
      return NextResponse.json(
        { success: false, error: "An application with this email is already pending" },
        { status: 409 }
      );
    }

    // Validate hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
    });

    if (!hostel) {
      return NextResponse.json(
        { success: false, error: "Invalid hostel selected" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create application
    const application = await prisma.application.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        aadharNumber,
        collegeIdUpload,
        allotmentCertificate,
        hostelId,
        roommatePreference,
        roommateQuestionnaire: roommateQuestionnaire || undefined,
      },
    });

    // Generate and send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });

    await sendOTPEmail(email, otp);

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted. Please verify your email with the OTP sent.",
        data: { applicationId: application.id, email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
