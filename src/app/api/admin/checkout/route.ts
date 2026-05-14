import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// GET: past students and pending checkout requests
export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);

    const pastStudents = await prisma.pastStudent.findMany({
      where: { hostelId: admin.hostelId },
      orderBy: { checkedOutAt: "desc" },
    });

    const pendingRequests = await prisma.checkoutRequest.findMany({
      where: {
        hostelId: admin.hostelId,
        status: "PENDING",
      },
      include: {
        user: {
          select: { name: true, email: true, phone: true, room: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { pastStudents, pendingRequests } });
  } catch (error) {
    console.error("Checkout data fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST: approve or reject checkout request
export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    const { requestId, action } = await request.json();

    if (!requestId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid request parameters" }, { status: 400 });
    }

    const checkoutRequest = await prisma.checkoutRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          include: { room: true },
        },
      },
    });

    if (!checkoutRequest) {
      return NextResponse.json({ success: false, error: "Checkout request not found" }, { status: 404 });
    }

    if (checkoutRequest.hostelId !== admin.hostelId) {
      return NextResponse.json({ success: false, error: "Request not in your hostel" }, { status: 403 });
    }

    if (checkoutRequest.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "Request is no longer pending" }, { status: 400 });
    }

    const student = checkoutRequest.user;

    if (action === "approve") {
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

      // 4. Send checkout notification
      await createNotification({
        userId: student.id,
        type: "CHECKOUT_REQUEST_APPROVED",
        title: "Checkout Request Approved",
        message: "Your permanent checkout request has been approved. Your account will now be deactivated.",
      });

      // 5. Update checkout request status (actually will be cascade deleted, but good practice if we changed cascade later)
      await prisma.checkoutRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" },
      });

      // 6. Permanently delete user from active records
      // Related data (Notifications, Leaves, CheckoutRequests etc.) are handled by cascade delete in schema
      await prisma.user.delete({
        where: { id: student.id },
      });

      return NextResponse.json({
        success: true,
        message: `${student.name}'s checkout request has been approved.`,
      });
    } else if (action === "reject") {
      await prisma.checkoutRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      await createNotification({
        userId: student.id,
        type: "CHECKOUT_REQUEST_REJECTED",
        title: "Checkout Request Rejected",
        message: "Your permanent checkout request was rejected by an admin. Please contact the warden for details.",
      });

      return NextResponse.json({
        success: true,
        message: `${student.name}'s checkout request has been rejected.`,
      });
    }

  } catch (error) {
    console.error("Checkout admin error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
