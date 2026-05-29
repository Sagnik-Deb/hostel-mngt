import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/hostels/[code] — Public hostel overview page data
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const hostel = await prisma.hostel.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        rooms: {
          select: {
            capacity: true,
          },
        },
        galleryImages: { orderBy: { order: "asc" } },
        administrations: { orderBy: { order: "asc" } },
        facilities: { orderBy: { createdAt: "asc" } },
        achievements: { orderBy: { date: "desc" } },
        _count: {
          select: {
            users: { where: { role: "STUDENT", status: { in: ["ACTIVE", "ON_LEAVE"] } } },
            rooms: true,
          },
        },
      },
    });

    if (!hostel) {
      return NextResponse.json({ success: false, error: "Hostel not found" }, { status: 404 });
    }

    const bedOccupancy = hostel.rooms.reduce((sum, r) => sum + r.capacity, 0);

    return NextResponse.json({
      success: true,
      data: {
        id: hostel.id,
        name: hostel.name,
        code: hostel.code,
        description: hostel.description,
        aboutUs: hostel.aboutUs,
        address: hostel.address,
        rules: hostel.rules,
        totalRooms: hostel.rooms.length || hostel.totalRooms || hostel._count.rooms,
        capacity: hostel.capacity,
        currentOccupancy: hostel._count.users,
        galleryImages: hostel.galleryImages,
        administrations: hostel.administrations,
        facilities: hostel.facilities,
        achievements: hostel.achievements,
        rooms: hostel.rooms,
        bedOccupancy,
      },
    });
  } catch (error) {
    console.error("Hostel overview fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
