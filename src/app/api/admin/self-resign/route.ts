import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// POST /api/admin/self-resign
// Allows a logged-in ADMIN to voluntarily resign their admin role.
// PRIMARY_ADMIN and SUPER_ADMIN cannot self-resign (must be revoked by another authority).
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only regular admins can self-resign. Primary admins require manual revocation." },
        { status: 403 }
      );
    }

    // Superadmin sessions have userId = "superadmin" (env-based, no DB record)
    if (user.userId === "superadmin") {
      return NextResponse.json({ success: false, error: "Superadmin cannot self-resign" }, { status: 403 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Admin record not found" }, { status: 404 });
    }

    const isDirectAdmin = !dbUser.collegeId && !dbUser.aadharNumber;

    // Resign logic: 
    // If they were directly registered as admin, they should not become students, just checkout.
    // Otherwise, demote back to STUDENT with REVOKED adminState.
    await prisma.user.update({
      where: { id: user.userId },
      data: isDirectAdmin 
        ? {
            status: "CHECKED_OUT",
            adminState: "REVOKED",
          }
        : {
            role: "STUDENT",
            adminState: "REVOKED",
            // Remove room and bed if they still have one assigned as admin
          },
    });

    // Optionally notify other admins
    const { notifyHostelAdmins } = await import("@/lib/notifications");
    await notifyHostelAdmins(
      dbUser.hostelId,
      "ADMIN_REVOKED",
      "Admin Resigned",
      `${dbUser.name} has voluntarily resigned from their admin role.`,
      "/admin/admin-mgmt"
    );

    return NextResponse.json({
      success: true,
      message: "You have successfully resigned from the admin role. You now have student access.",
    });
  } catch (error) {
    console.error("Self-resign error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
