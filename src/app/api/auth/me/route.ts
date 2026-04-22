import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── Superadmin session: no DB record, return synthetic data ──
    if (authUser.userId === "superadmin" || authUser.role === "SUPER_ADMIN") {
      const hostel = await prisma.hostel.findUnique({
        where: { id: authUser.hostelId },
        select: { id: true, name: true, code: true },
      });
      return NextResponse.json({
        success: true,
        data: {
          id: "superadmin",
          name: "Super Admin",
          email: authUser.email,
          phone: null,
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          adminState: "APPROVED",
          hostelId: authUser.hostelId,
          hostelName: hostel?.name || "",
          hostelCode: hostel?.code || "",
          hostel: hostel ?? null,
          room: null,
          bedNumber: null,
          profileImage: null,
          createdAt: new Date().toISOString(),
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: {
        hostel: { select: { id: true, name: true, code: true } },
        room: { select: { id: true, number: true, floor: true, roomType: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        adminState: user.adminState,
        hostelId: user.hostelId,
        hostel: user.hostel,
        room: user.room,
        bedNumber: user.bedNumber,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
