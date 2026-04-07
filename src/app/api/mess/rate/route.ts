import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { menuId, rating, comment } = await request.json();

    if (!menuId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Menu ID and rating (1-5) are required" },
        { status: 400 }
      );
    }

    const messRating = await prisma.messRating.upsert({
      where: {
        userId_menuId: {
          userId: user.userId,
          menuId,
        },
      },
      update: { rating, comment },
      create: {
        userId: user.userId,
        menuId,
        rating,
        comment,
      },
    });

    return NextResponse.json({ success: true, data: messRating, message: "Rating submitted" });
  } catch (error) {
    console.error("Mess rating error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
