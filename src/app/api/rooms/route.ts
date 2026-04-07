import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await prisma.room.findMany({
      where: { hostelId: user.hostelId },
      include: {
        occupants: {
          where: { status: { in: ["ACTIVE", "ON_LEAVE"] } },
          select: {
            id: true, name: true, email: true, phone: true,
            status: true, bedNumber: true, profileImage: true,
          },
        },
      },
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    });

    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error("Rooms fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    const { roomId, userId, bedNumber, action } = await request.json();

    if (action === "assign") {
      // Assign student to room
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
      }
      if (room.hostelId !== admin.hostelId) {
        return NextResponse.json({ success: false, error: "Room not in your hostel" }, { status: 403 });
      }
      if (room.occupied >= room.capacity) {
        return NextResponse.json({ success: false, error: "Room is full" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { roomId, bedNumber },
      });

      await prisma.room.update({
        where: { id: roomId },
        data: { occupied: { increment: 1 } },
      });

      return NextResponse.json({ success: true, message: "Student assigned to room" });
    }

    if (action === "remove") {
      await prisma.user.update({
        where: { id: userId },
        data: { roomId: null, bedNumber: null },
      });

      await prisma.room.update({
        where: { id: roomId },
        data: { occupied: { decrement: 1 } },
      });

      return NextResponse.json({ success: true, message: "Student removed from room" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Room update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
