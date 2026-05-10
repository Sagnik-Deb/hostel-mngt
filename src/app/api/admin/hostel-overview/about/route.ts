import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH — update the hostel's aboutUs text
export async function PATCH(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const body = await req.json();
    const { aboutUs } = body;

    if (typeof aboutUs !== "string")
      return NextResponse.json({ success: false, error: "aboutUs must be a string" }, { status: 400 });

    const updated = await prisma.hostel.update({
      where: { id: user.hostelId },
      data: { aboutUs },
      select: { id: true, aboutUs: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
