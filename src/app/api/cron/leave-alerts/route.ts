import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendLeaveReminderEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // Find leaves due in the next 24 hours
    const dueLeavesForReminder = await prisma.leaveRequest.findMany({
      where: {
        status: { in: ["APPROVED", "ACTIVE"] },
        endDate: {
          gte: todayStart,
          lte: tomorrow,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    let notified = 0;

    for (const leave of dueLeavesForReminder) {
      // Create in-app notification
      await createNotification({
        userId: leave.userId,
        type: "LEAVE_REMINDER",
        title: "Leave Ending Tomorrow",
        message: `Your leave ends on ${leave.endDate.toLocaleDateString()}. Please return to hostel or request an extension.`,
        link: "/student/leave",
      });

      // Send email reminder
      await sendLeaveReminderEmail(
        leave.user.email,
        leave.user.name,
        leave.endDate.toLocaleDateString()
      );

      notified++;
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${notified} leave reminders`,
      data: { notified },
    });
  } catch (error) {
    console.error("Cron leave alerts error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
