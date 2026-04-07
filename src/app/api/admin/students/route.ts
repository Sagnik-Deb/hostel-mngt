import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);

    const students = await prisma.user.findMany({
      where: {
        hostelId: admin.hostelId,
        role: "STUDENT",
        status: { in: ["ACTIVE", "ON_LEAVE", "PENDING_APPROVAL"] },
      },
      include: {
        room: { select: { number: true, floor: true, roomType: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error("Students fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
