import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requirePrimaryAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// GET: List admins for current hostel
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user || (user.role !== "ADMIN" && user.role !== "PRIMARY_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admins = await prisma.user.findMany({
      where: {
        hostelId: user.hostelId,
        role: { in: ["ADMIN", "PRIMARY_ADMIN"] },
      },
      select: {
        id: true, name: true, email: true, role: true,
        adminState: true, createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    console.error("Admin list error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST: Promote student to admin, approve pending admin, or revoke admin
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { action, targetUserId } = await request.json();

    // ── Promote Student to Admin (PRIMARY_ADMIN / SUPER_ADMIN only) ──
    if (action === "promote") {
      if (user.role !== "PRIMARY_ADMIN" && user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { success: false, error: "Only the Primary Admin can promote students" },
          { status: 403 }
        );
      }

      const target = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!target || target.role !== "STUDENT") {
        return NextResponse.json({ success: false, error: "Target must be a student" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          role: "ADMIN",
          adminState: "PENDING", // Must be approved by existing hostel admin
        },
      });

      await createNotification({
        userId: targetUserId,
        type: "ADMIN_PROMOTED",
        title: "Admin Promotion",
        message: "You have been promoted to Admin! Your access is pending approval from the hostel admin.",
      });

      return NextResponse.json({ success: true, message: "Student promoted to Admin (pending approval)" });
    }

    // ── Approve Pending Admin (any existing approved admin or super_admin) ──
    if (action === "approve") {
      if (user.role !== "ADMIN" && user.role !== "PRIMARY_ADMIN" && user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
      }

      const target = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!target || target.adminState !== "PENDING") {
        return NextResponse.json({ success: false, error: "No pending admin to approve" }, { status: 400 });
      }

      if (target.hostelId !== user.hostelId) {
        return NextResponse.json({ success: false, error: "Not in your hostel" }, { status: 403 });
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: { adminState: "APPROVED" },
      });

      await createNotification({
        userId: targetUserId,
        type: "ADMIN_APPROVED",
        title: "Admin Access Approved",
        message: "Your admin access has been approved. You can now access the admin dashboard.",
      });

      return NextResponse.json({ success: true, message: "Admin approved" });
    }

    // ── Revoke Admin (PRIMARY_ADMIN / SUPER_ADMIN only) ──
    if (action === "revoke") {
      if (user.role !== "PRIMARY_ADMIN" && user.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          { success: false, error: "Only the Primary Admin can revoke admin access" },
          { status: 403 }
        );
      }

      const target = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!target || target.role !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Target must be an admin" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          role: "STUDENT",
          adminState: "REVOKED",
        },
      });

      await createNotification({
        userId: targetUserId,
        type: "ADMIN_REVOKED",
        title: "Admin Access Revoked",
        message: "Your admin access has been revoked. You have been returned to student status.",
      });

      return NextResponse.json({ success: true, message: "Admin access revoked" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin management error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
