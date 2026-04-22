import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "";
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "";

export async function POST(request: NextRequest) {
  try {
    const { email, password, hostelId } = await request.json();

    if (!email || !password || !hostelId) {
      return NextResponse.json(
        { success: false, error: "Email, password, and hostel selection are required" },
        { status: 400 }
      );
    }

    // Validate superadmin credentials against env vars
    if (email !== SUPERADMIN_EMAIL || password !== SUPERADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Invalid superadmin credentials" },
        { status: 401 }
      );
    }

    // Validate the selected hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
    });

    if (!hostel) {
      return NextResponse.json(
        { success: false, error: "Invalid hostel selected" },
        { status: 400 }
      );
    }

    // Issue a JWT with SUPER_ADMIN role and the chosen hostelId
    // We use a synthetic userId to distinguish superadmin sessions
    const token = signToken({
      userId: "superadmin",
      email: SUPERADMIN_EMAIL,
      role: "SUPER_ADMIN",
      hostelId: hostel.id,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: "superadmin",
          name: "Super Admin",
          email: SUPERADMIN_EMAIL,
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          hostelId: hostel.id,
          hostelName: hostel.name,
          hostelCode: hostel.code,
          roomId: null,
          profileImage: null,
        },
      },
    });

    // Set httpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Superadmin login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
