import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createNotification, notifyHostelAdmins } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);

    const applications = await prisma.application.findMany({
      where: { hostelId: admin.hostelId, emailVerified: true },
      include: { hostel: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    const { applicationId, action, roomId, bedNumber } = await request.json();

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    if (application.hostelId !== admin.hostelId) {
      return NextResponse.json({ success: false, error: "Not your hostel" }, { status: 403 });
    }

    if (action === "approve") {
      // Create user from application
      const user = await prisma.user.create({
        data: {
          email: application.email,
          password: application.password,
          name: application.name,
          phone: application.phone,
          aadharNumber: application.aadharNumber,
          collegeId: application.collegeIdUpload,
          hostelId: application.hostelId,
          role: "STUDENT",
          status: "ACTIVE",
          roomId: roomId || null,
          bedNumber: bedNumber || null,
        },
      });

      // Update room occupancy if assigned
      if (roomId) {
        await prisma.room.update({
          where: { id: roomId },
          data: { occupied: { increment: 1 } },
        });
      }

      // Delete application
      await prisma.application.delete({ where: { id: applicationId } });

      // Notify student
      await createNotification({
        userId: user.id,
        type: "STUDENT_APPROVED",
        title: "Application Approved!",
        message: "Your hostel application has been approved. Welcome aboard!",
        link: "/student/dashboard",
      });

      return NextResponse.json({ success: true, message: "Student approved and account created" });
    }

    if (action === "reject") {
      // Delete application
      await prisma.application.delete({ where: { id: applicationId } });

      return NextResponse.json({ success: true, message: "Application rejected and removed" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Application action error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
