import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

// GET — list achievements for admin's hostel
export async function GET(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const achievements = await prisma.hostelAchievement.findMany({
      where: { hostelId: user.hostelId },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, data: achievements });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST — add a new achievement
export async function POST(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const dateStr = formData.get("date") as string;
    const file = formData.get("photo") as File | null;

    if (!title || !dateStr)
      return NextResponse.json({ success: false, error: "Title and date are required" }, { status: 400 });

    let photoUrl: string | null = null;
    let publicId: string | null = null;

    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type))
        return NextResponse.json({ success: false, error: "Only JPG, PNG, WebP allowed" }, { status: 400 });
      if (file.size > MAX_SIZE)
        return NextResponse.json({ success: false, error: "Max file size is 5 MB" }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, "hostel-overview/achievements");
      photoUrl = result.secure_url;
      publicId = result.public_id;
    }

    const achievement = await prisma.hostelAchievement.create({
      data: {
        hostelId: user.hostelId,
        title,
        description: description || null,
        photoUrl,
        publicId,
        date: new Date(dateStr),
      },
    });

    return NextResponse.json({ success: true, data: achievement }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    console.error("Achievement create error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — update an achievement by id
export async function PATCH(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const existing = await prisma.hostelAchievement.findUnique({ where: { id } });
    if (!existing || existing.hostelId !== user.hostelId)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const formData = await req.formData();
    const title = (formData.get("title") as string) || existing.title;
    const description = formData.get("description") as string | null;
    const dateStr = formData.get("date") as string | null;
    const file = formData.get("photo") as File | null;

    let photoUrl = existing.photoUrl;
    let publicId = existing.publicId;

    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type))
        return NextResponse.json({ success: false, error: "Only JPG, PNG, WebP allowed" }, { status: 400 });
      const buffer = Buffer.from(await file.arrayBuffer());
      if (existing.publicId) await deleteFromCloudinary(existing.publicId);
      const result = await uploadToCloudinary(buffer, "hostel-overview/achievements");
      photoUrl = result.secure_url;
      publicId = result.public_id;
    }

    const updated = await prisma.hostelAchievement.update({
      where: { id },
      data: {
        title,
        description: description !== null ? description : existing.description,
        date: dateStr ? new Date(dateStr) : existing.date,
        photoUrl,
        publicId,
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

// DELETE — remove an achievement by id
export async function DELETE(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const existing = await prisma.hostelAchievement.findUnique({ where: { id } });
    if (!existing || existing.hostelId !== user.hostelId)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    if (existing.publicId) await deleteFromCloudinary(existing.publicId);
    await prisma.hostelAchievement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
