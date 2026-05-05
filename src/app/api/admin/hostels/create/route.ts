import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "";
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      adminEmail,
      adminPassword,
      name,
      code,
      wardenName,
      wardenEmail,
      wardenPhone,
      description,
      address,
      totalRooms,
      capacity
    } = data;

    // Validate Superadmin credentials
    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: "Superadmin credentials are required" },
        { status: 400 }
      );
    }

    if (adminEmail !== SUPERADMIN_EMAIL || adminPassword !== SUPERADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Invalid superadmin credentials" },
        { status: 401 }
      );
    }

    // Validate required hostel fields
    if (!name || !code || !wardenName || !wardenEmail || !wardenPhone) {
      return NextResponse.json(
        { success: false, error: "Missing required hostel fields" },
        { status: 400 }
      );
    }

    // Check if hostel name or code already exists
    const existingHostel = await prisma.hostel.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    });

    if (existingHostel) {
      return NextResponse.json(
        { success: false, error: "A hostel with this name or code already exists" },
        { status: 400 }
      );
    }

    // Create the new hostel
    const newHostel = await prisma.hostel.create({
      data: {
        name,
        code: code.toUpperCase(),
        wardenName,
        wardenEmail,
        wardenPhone,
        description: description || null,
        address: address || null,
        totalRooms: totalRooms ? parseInt(totalRooms.toString(), 10) : 0,
        capacity: capacity ? parseInt(capacity.toString(), 10) : 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: newHostel,
      message: "Hostel created successfully",
    });
  } catch (error) {
    console.error("Create hostel error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
