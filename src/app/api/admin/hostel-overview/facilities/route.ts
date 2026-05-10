import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — list facilities for admin's hostel
export async function GET(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const facilities = await prisma.hostelFacility.findMany({
      where: { hostelId: user.hostelId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, data: facilities });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST — add a new facility
export async function POST(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const body = await req.json();
    const { name, description, icon } = body;

    if (!name)
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });

    const facility = await prisma.hostelFacility.create({
      data: { hostelId: user.hostelId, name, description: description || null, icon: icon || null },
    });

    return NextResponse.json({ success: true, data: facility }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update a facility by id
export async function PATCH(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const existing = await prisma.hostelFacility.findUnique({ where: { id } });
    if (!existing || existing.hostelId !== user.hostelId)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const body = await req.json();
    const updated = await prisma.hostelFacility.update({
      where: { id },
      data: {
        name: body.name || existing.name,
        description: body.description !== undefined ? body.description : existing.description,
        icon: body.icon !== undefined ? body.icon : existing.icon,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — remove a facility by id
export async function DELETE(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const existing = await prisma.hostelFacility.findUnique({ where: { id } });
    if (!existing || existing.hostelId !== user.hostelId)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await prisma.hostelFacility.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
