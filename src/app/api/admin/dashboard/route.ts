import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request);

    const [
      totalStudents,
      totalRooms,
      roomStats,
      activeLeaves,
      pendingApplications,
      pendingLeaves,
      openComplaints,
      pendingAdmins,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          hostelId: admin.hostelId,
          role: "STUDENT",
          status: { in: ["ACTIVE", "ON_LEAVE"] },
        },
      }),
      prisma.room.count({ where: { hostelId: admin.hostelId } }),
      prisma.room.aggregate({
        where: { hostelId: admin.hostelId },
        _sum: { occupied: true, capacity: true },
      }),
      prisma.leaveRequest.count({
        where: {
          user: { hostelId: admin.hostelId },
          status: { in: ["APPROVED", "ACTIVE"] },
        },
      }),
      prisma.application.count({
        where: { hostelId: admin.hostelId, emailVerified: true },
      }),
      prisma.leaveRequest.count({
        where: {
          user: { hostelId: admin.hostelId },
          status: "PENDING",
        },
      }),
      prisma.complaint.count({
        where: {
          hostelId: admin.hostelId,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      }),
      prisma.user.count({
        where: {
          hostelId: admin.hostelId,
          role: "ADMIN",
          adminState: "PENDING",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalRooms,
        occupiedBeds: roomStats._sum.occupied || 0,
        totalCapacity: roomStats._sum.capacity || 0,
        activeLeaves,
        pendingApplications,
        pendingLeaves,
        openComplaints,
        pendingAdmins,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
