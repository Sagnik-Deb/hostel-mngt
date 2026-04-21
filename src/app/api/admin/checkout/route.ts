import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student ID required" }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { room: true },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    if (student.hostelId !== admin.hostelId) {
      return NextResponse.json({ success: false, error: "Student not in your hostel" }, { status: 403 });
    }

    if (student.status === "CHECKED_OUT") {
      return NextResponse.json({ success: false, error: "Student already checked out" }, { status: 400 });
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
        checkedOutBy: admin.userId,
      },
    });

    // 2. Free up room bed
    if (student.roomId) {
      await prisma.room.update({
        where: { id: student.roomId },
        data: { occupied: { decrement: 1 } },
      });
    }

    // 3. Cancel any active leaves
    await prisma.leaveRequest.updateMany({
      where: {
        userId: student.id,
        status: { in: ["PENDING", "APPROVED", "ACTIVE", "EXTENSION_REQUESTED", "RETURN_REQUESTED"] },
      },
      data: { status: "CANCELLED" },
    });

    // 4. Send checkout notification before removing access
    await createNotification({
      userId: student.id,
      type: "CHECKOUT_INITIATED",
      title: "Permanent Checkout",
      message: "You have been permanently checked out of the hostel. Thank you for your stay.",
    });

    // 5. Permanently delete user from active records
    // Related data (Notifications, Leaves, etc.) are handled by cascade delete in schema
    await prisma.user.delete({
      where: { id: student.id },
    });

    return NextResponse.json({
      success: true,
      message: `${student.name} has been permanently checked out and archived.`,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// GET past students
export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);

    const pastStudents = await prisma.pastStudent.findMany({
      where: { hostelId: admin.hostelId },
      orderBy: { checkedOutAt: "desc" },
    });

    return NextResponse.json({ success: true, data: pastStudents });
  } catch (error) {
    console.error("Past students fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
