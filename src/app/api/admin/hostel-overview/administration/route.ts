import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

// GET — list administration staff for admin's hostel
export async function GET(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const staff = await prisma.hostelAdministration.findMany({
      where: { hostelId: user.hostelId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: staff });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST — add a new staff member
export async function POST(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const orderStr = formData.get("order") as string;
    const file = formData.get("photo") as File | null;

    if (!name || !role)
      return NextResponse.json({ success: false, error: "Name and role are required" }, { status: 400 });

    let photoUrl: string | null = null;
    let publicId: string | null = null;

    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type))
        return NextResponse.json({ success: false, error: "Only JPG, PNG, WebP allowed" }, { status: 400 });
      if (file.size > MAX_SIZE)
        return NextResponse.json({ success: false, error: "Max file size is 5 MB" }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, "hostel-overview/administration");
      photoUrl = result.secure_url;
      publicId = result.public_id;
    }

    const maxOrder = await prisma.hostelAdministration.aggregate({
      where: { hostelId: user.hostelId },
      _max: { order: true },
    });
    const order = orderStr ? parseInt(orderStr) : (maxOrder._max.order ?? -1) + 1;

    const staff = await prisma.hostelAdministration.create({
      data: { hostelId: user.hostelId, name, role, photoUrl, publicId, order },
    });

    return NextResponse.json({ success: true, data: staff }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    console.error("Administration create error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update a staff member by id
export async function PATCH(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const existing = await prisma.hostelAdministration.findUnique({ where: { id } });
    if (!existing || existing.hostelId !== user.hostelId)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const formData = await req.formData();
    const name = (formData.get("name") as string) || existing.name;
    const role = (formData.get("role") as string) || existing.role;
    const file = formData.get("photo") as File | null;

    let photoUrl = existing.photoUrl;
    let publicId = existing.publicId;

    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type))
        return NextResponse.json({ success: false, error: "Only JPG, PNG, WebP allowed" }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      if (existing.publicId) await deleteFromCloudinary(existing.publicId);
      const result = await uploadToCloudinary(buffer, "hostel-overview/administration");
      photoUrl = result.secure_url;
      publicId = result.public_id;
    }

    const updated = await prisma.hostelAdministration.update({
      where: { id },
      data: { name, role, photoUrl, publicId },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — remove a staff member by id
export async function DELETE(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const existing = await prisma.hostelAdministration.findUnique({ where: { id } });
    if (!existing || existing.hostelId !== user.hostelId)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    if (existing.publicId) await deleteFromCloudinary(existing.publicId);
    await prisma.hostelAdministration.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
