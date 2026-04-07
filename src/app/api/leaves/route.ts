import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createNotification, notifyHostelAdmins } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const where =
      user.role === "STUDENT"
        ? { userId: user.userId }
        : { user: { hostelId: user.hostelId } };

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true, name: true, email: true, phone: true,
            status: true, roomId: true, bedNumber: true,
            room: { select: { number: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: leaves });
  } catch (error) {
    console.error("Leaves fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { reason, startDate, endDate } = await request.json();

    if (!reason || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Reason, start date, and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json(
        { success: false, error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Check for existing active leave
    const existingLeave = await prisma.leaveRequest.findFirst({
      where: {
        userId: user.userId,
        status: { in: ["PENDING", "APPROVED", "ACTIVE", "EXTENSION_REQUESTED"] },
      },
    });

    if (existingLeave) {
      return NextResponse.json(
        { success: false, error: "You already have an active or pending leave request" },
        { status: 400 }
      );
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: user.userId,
        reason,
        startDate: start,
        endDate: end,
        originalEnd: end,
      },
    });

    // Notify hostel admins
    const student = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true },
    });

    await notifyHostelAdmins(
      user.hostelId,
      "LEAVE_REQUEST",
      "New Leave Request",
      `${student?.name} has submitted a leave request from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`,
      "/admin/leaves"
    );

    return NextResponse.json(
      { success: true, data: leave, message: "Leave request submitted" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Leave create error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
