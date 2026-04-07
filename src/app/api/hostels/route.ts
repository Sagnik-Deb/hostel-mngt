import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hostels = await prisma.hostel.findMany({
      include: {
        _count: {
          select: {
            users: { where: { role: "STUDENT", status: { in: ["ACTIVE", "ON_LEAVE"] } } },
            rooms: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = hostels.map((h) => ({
      id: h.id,
      name: h.name,
      code: h.code,
      description: h.description,
      wardenName: h.wardenName,
      wardenEmail: h.wardenEmail,
      wardenPhone: h.wardenPhone,
      address: h.address,
      rules: h.rules,
      imageUrl: h.imageUrl,
      totalRooms: h.totalRooms || h._count.rooms,
      capacity: h.capacity,
      currentOccupancy: h._count.users,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Hostels fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
