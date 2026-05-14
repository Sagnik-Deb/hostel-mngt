import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const notices = await prisma.notice.findMany({
      where: { hostelId: user.hostelId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: notices });
  } catch (error) {
    console.error("Notices GET error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    const { title, message } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        message,
        hostelId: admin.hostelId,
      },
    });

    // Notify all active students
    const students = await prisma.user.findMany({
      where: {
        hostelId: admin.hostelId,
        role: "STUDENT",
        status: { in: ["ACTIVE", "ON_LEAVE"] }
      },
      select: { id: true, email: true }
    });

    if (students.length > 0) {
      // 1. Create in-app notifications
      const notificationsData = students.map(s => ({
        userId: s.id,
        type: "GENERAL" as const,
        title: `New Notice: ${title}`,
        message: message.substring(0, 100) + (message.length > 100 ? "..." : ""),
        link: "/student/dashboard",
      }));
      
      await prisma.notification.createMany({
        data: notificationsData
      });

      // 2. Send emails in the background (fire and forget)
      Promise.all(
        students.map(s => sendNotificationEmail(s.email, `New Notice: ${title}`, message))
      ).catch(err => console.error("Error sending notice emails:", err));
    }

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    console.error("Notices POST error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Notice ID is required" }, { status: 400 });
    }

    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return NextResponse.json({ success: false, error: "Notice not found" }, { status: 404 });
    }

    if (notice.hostelId !== admin.hostelId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await prisma.notice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Notices DELETE error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
