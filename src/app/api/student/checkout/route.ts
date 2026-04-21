import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const student = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { room: true },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json({ success: false, error: "Only student accounts can self-checkout" }, { status: 403 });
    }

    // 1. Archive to PastStudent
    await prisma.pastStudent.create({
      data: {
        originalId: student.id,
        email: student.email,
        name: student.name,
        phone: student.phone,
        aadharNumber: student.aadharNumber,
        collegeId: student.collegeId,
        hostelId: student.hostelId,
        roomNumber: student.room?.number || null,
        joinedAt: student.createdAt,
        checkedOutBy: "SELF",
      },
    });

    // 2. Free up room bed
    if (student.roomId) {
      await prisma.room.update({
        where: { id: student.roomId },
        data: { occupied: { decrement: 1 } },
      });
    }

    // 3. Permanently delete user from active records
    // Related data (Notifications, Leaves, etc.) are handled by cascade delete in schema
    await prisma.user.delete({
      where: { id: student.id },
    });

    // The response will signal the client to clear auth state
    return NextResponse.json({
      success: true,
      message: "You have been permanently checked out and your account has been removed. Thank you for your stay.",
    });
  } catch (error) {
    console.error("Self-checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }
}
