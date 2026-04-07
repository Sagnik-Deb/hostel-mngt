import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createNotification, notifyHostelAdmins } from "@/lib/notifications";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, adminNotes, extensionReason, newEndDate, returnReason } = body;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { user: { select: { name: true, hostelId: true, id: true } } },
    });

    if (!leave) {
      return NextResponse.json({ success: false, error: "Leave request not found" }, { status: 404 });
    }

    // ── Admin Actions ──
    if (action === "approve" && (user.role === "ADMIN" || user.role === "PRIMARY_ADMIN")) {
      await prisma.leaveRequest.update({
        where: { id },
        data: { status: "APPROVED", adminNotes },
      });

      await prisma.user.update({
        where: { id: leave.userId },
        data: { status: "ON_LEAVE" },
      });

      await createNotification({
        userId: leave.userId,
        type: "LEAVE_APPROVED",
        title: "Leave Approved",
        message: `Your leave request has been approved.${adminNotes ? ` Note: ${adminNotes}` : ""}`,
        link: "/student/leave",
      });

      return NextResponse.json({ success: true, message: "Leave approved" });
    }

    if (action === "reject" && (user.role === "ADMIN" || user.role === "PRIMARY_ADMIN")) {
      await prisma.leaveRequest.update({
        where: { id },
        data: { status: "REJECTED", adminNotes },
      });

      await createNotification({
        userId: leave.userId,
        type: "LEAVE_REJECTED",
        title: "Leave Rejected",
        message: `Your leave request has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ""}`,
        link: "/student/leave",
      });

      return NextResponse.json({ success: true, message: "Leave rejected" });
    }

    if (action === "confirm-return" && (user.role === "ADMIN" || user.role === "PRIMARY_ADMIN")) {
      await prisma.leaveRequest.update({
        where: { id },
        data: { status: "COMPLETED", adminNotes },
      });

      await prisma.user.update({
        where: { id: leave.userId },
        data: { status: "ACTIVE" },
      });

      await createNotification({
        userId: leave.userId,
        type: "LEAVE_RETURN_CONFIRMED",
        title: "Return Confirmed",
        message: "Your return to hostel has been confirmed by the admin.",
        link: "/student/leave",
      });

      return NextResponse.json({ success: true, message: "Return confirmed" });
    }

    if (action === "approve-extension" && (user.role === "ADMIN" || user.role === "PRIMARY_ADMIN")) {
      if (!newEndDate && !leave.endDate) {
        return NextResponse.json({ success: false, error: "New end date required" }, { status: 400 });
      }

      const extensionEnd = newEndDate ? new Date(newEndDate) : leave.endDate;

      await prisma.leaveRequest.update({
        where: { id },
        data: {
          status: "ACTIVE",
          endDate: extensionEnd,
          adminNotes,
        },
      });

      await createNotification({
        userId: leave.userId,
        type: "LEAVE_EXTENSION_APPROVED",
        title: "Extension Approved",
        message: `Your leave extension has been approved until ${extensionEnd.toLocaleDateString()}.`,
        link: "/student/leave",
      });

      return NextResponse.json({ success: true, message: "Extension approved" });
    }

    if (action === "reject-extension" && (user.role === "ADMIN" || user.role === "PRIMARY_ADMIN")) {
      await prisma.leaveRequest.update({
        where: { id },
        data: { status: "ACTIVE", adminNotes },
      });

      await createNotification({
        userId: leave.userId,
        type: "LEAVE_EXTENSION_REJECTED",
        title: "Extension Rejected",
        message: `Your leave extension request has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ""}`,
        link: "/student/leave",
      });

      return NextResponse.json({ success: true, message: "Extension rejected" });
    }

    // ── Student Actions ──
    if (action === "request-extension" && user.role === "STUDENT") {
      if (!extensionReason || !newEndDate) {
        return NextResponse.json(
          { success: false, error: "Extension reason and new end date required" },
          { status: 400 }
        );
      }

      await prisma.leaveRequest.update({
        where: { id },
        data: {
          status: "EXTENSION_REQUESTED",
          extensionReason,
          endDate: new Date(newEndDate),
        },
      });

      await notifyHostelAdmins(
        leave.user.hostelId,
        "LEAVE_EXTENSION",
        "Leave Extension Requested",
        `${leave.user.name} has requested a leave extension until ${new Date(newEndDate).toLocaleDateString()}. Reason: ${extensionReason}`,
        "/admin/leaves"
      );

      return NextResponse.json({ success: true, message: "Extension requested" });
    }

    if (action === "request-return" && user.role === "STUDENT") {
      await prisma.leaveRequest.update({
        where: { id },
        data: {
          status: "RETURN_REQUESTED",
          returnReason: returnReason || "Student has returned to hostel",
        },
      });

      await notifyHostelAdmins(
        leave.user.hostelId,
        "LEAVE_RETURN_REQUEST",
        "Student Return Request",
        `${leave.user.name} has indicated they have returned and is requesting confirmation.`,
        "/admin/leaves"
      );

      return NextResponse.json({ success: true, message: "Return request submitted" });
    }

    if (action === "cancel" && user.role === "STUDENT") {
      if (leave.status !== "PENDING") {
        return NextResponse.json(
          { success: false, error: "Can only cancel pending leave requests" },
          { status: 400 }
        );
      }

      await prisma.leaveRequest.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return NextResponse.json({ success: true, message: "Leave request cancelled" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Leave update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
