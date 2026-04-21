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
            aadharNumber: true, collegeId: true, createdAt: true,
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

export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    const { number, floor, capacity, roomType } = await request.json();

    if (!number || floor === undefined || !capacity || !roomType) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    // Check if room already exists in this hostel
    const existingRoom = await prisma.room.findUnique({
      where: {
        hostelId_number: {
          hostelId: admin.hostelId,
          number: number
        }
      }
    });

    if (existingRoom) {
      return NextResponse.json({ success: false, error: "Room number already exists in this hostel" }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        number,
        floor: Number(floor),
        capacity: Number(capacity),
        roomType,
        hostelId: admin.hostelId,
      },
    });

    return NextResponse.json({ success: true, data: room });
  } catch (error) {
    console.error("Room creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Forbidden") || errorMessage.includes("Unauthorized") ? 403 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
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

export async function DELETE(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ success: false, error: "Room ID is required" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        occupants: {
          where: { status: { in: ["ACTIVE", "ON_LEAVE"] } }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
    }

    if (room.hostelId !== admin.hostelId) {
      return NextResponse.json({ success: false, error: "Unauthorized access to this room" }, { status: 403 });
    }

    if (room.occupants.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot delete an occupied room. Please checkout students first." 
      }, { status: 400 });
    }

    await prisma.room.delete({
      where: { id: roomId },
    });

    return NextResponse.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    console.error("Room deletion error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
