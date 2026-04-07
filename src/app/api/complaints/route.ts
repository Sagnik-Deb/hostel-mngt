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
        : { hostelId: user.hostelId };

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, room: { select: { number: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: complaints });
  } catch (error) {
    console.error("Complaints fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { subject, description, category, priority } = await request.json();

    if (!subject || !description) {
      return NextResponse.json(
        { success: false, error: "Subject and description are required" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: user.userId,
        hostelId: user.hostelId,
        subject,
        description,
        category,
        priority: priority || "MEDIUM",
      },
    });

    const student = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true },
    });

    await notifyHostelAdmins(
      user.hostelId,
      "COMPLAINT_CREATED",
      "New Complaint",
      `${student?.name} has raised a complaint: ${subject}`,
      "/admin/complaints"
    );

    return NextResponse.json(
      { success: true, data: complaint, message: "Complaint submitted" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Complaint create error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user || (user.role !== "ADMIN" && user.role !== "PRIMARY_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { complaintId, status, response } = await request.json();

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status, response },
    });

    const notifType = status === "RESOLVED" ? "COMPLAINT_RESOLVED" : "COMPLAINT_UPDATED";

    await createNotification({
      userId: complaint.userId,
      type: notifType,
      title: status === "RESOLVED" ? "Complaint Resolved" : "Complaint Updated",
      message: `Your complaint "${complaint.subject}" has been ${status.toLowerCase()}.${response ? ` Response: ${response}` : ""}`,
      link: "/student/complaints",
    });

    return NextResponse.json({ success: true, data: complaint, message: "Complaint updated" });
  } catch (error) {
    console.error("Complaint update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
