import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const hostelId = searchParams.get("hostelId") || user.hostelId;

    const menus = await prisma.messMenu.findMany({
      where: { hostelId },
      include: {
        ratings: {
          select: { rating: true },
        },
      },
      orderBy: [{ day: "asc" }, { mealType: "asc" }],
    });

    const data = menus.map((m) => ({
      ...m,
      avgRating:
        m.ratings.length > 0
          ? m.ratings.reduce((sum, r) => sum + r.rating, 0) / m.ratings.length
          : 0,
      totalRatings: m.ratings.length,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Mess menu fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
    const user = getAuthUser(request)!;

    const { day, mealType, items } = await request.json();

    if (!day || !mealType || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: "Day, meal type, and items are required" },
        { status: 400 }
      );
    }

    const menu = await prisma.messMenu.upsert({
      where: {
        hostelId_day_mealType: {
          hostelId: user.hostelId,
          day,
          mealType,
        },
      },
      update: { items },
      create: {
        hostelId: user.hostelId,
        day,
        mealType,
        items,
      },
    });

    // Notify all students in the hostel
    const students = await prisma.user.findMany({
      where: {
        hostelId: user.hostelId,
        role: "STUDENT",
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map((s) => ({
          userId: s.id,
          type: "MESS_MENU_UPDATED",
          title: "🍽️ Mess Menu Updated",
          message: `The ${mealType.toLowerCase()} menu for ${day} has been updated.`,
          link: "/student/mess-menu",
        })),
      });
    }

    return NextResponse.json({ success: true, data: menu, message: "Menu updated and notifications sent" });
  } catch (error) {
    console.error("Mess menu update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
