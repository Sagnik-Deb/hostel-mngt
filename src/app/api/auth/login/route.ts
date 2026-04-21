import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, hostelId, loginType } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { hostel: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is checked out
    if (user.status === "CHECKED_OUT") {
      return NextResponse.json(
        { success: false, error: "This account has been permanently checked out. You can no longer access the system." },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Role-based login validation
    if (loginType === "admin") {
      if (user.role !== "ADMIN" && user.role !== "PRIMARY_ADMIN") {
        return NextResponse.json(
          { success: false, error: "This is an admin portal. Student accounts cannot login here." },
          { status: 403 }
        );
      }

      // Check admin approval state
      if (user.adminState === "PENDING") {
        return NextResponse.json(
          { success: false, error: "Your admin access is pending approval. Please wait for an existing admin to approve." },
          { status: 403 }
        );
      }

      if (user.adminState === "REVOKED") {
        return NextResponse.json(
          { success: false, error: "Your admin access has been revoked." },
          { status: 403 }
        );
      }
    } else {
      // Student login
      if (user.role !== "STUDENT") {
        return NextResponse.json(
          { success: false, error: "This is a student portal. Admin accounts must use the Admin Login portal." },
          { status: 403 }
        );
      }

      // Validate hostel binding
      if (hostelId && user.hostelId !== hostelId) {
        return NextResponse.json(
          { success: false, error: "You are not registered in this hostel" },
          { status: 403 }
        );
      }
    }

    // Sign JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      hostelId: user.hostelId,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          hostelId: user.hostelId,
          hostelName: user.hostel.name,
          roomId: user.roomId,
          profileImage: user.profileImage,
        },
      },
    });

    // Set token as httpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
