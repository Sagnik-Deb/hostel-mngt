import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

// GET — list images for admin's hostel
export async function GET(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const images = await prisma.hostelImage.findMany({
      where: { hostelId: user.hostelId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: images });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST — upload a new gallery image
export async function POST(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || "";

    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ success: false, error: "Only JPG, PNG, WebP allowed" }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ success: false, error: "Max file size is 5 MB" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const { public_id, secure_url } = await uploadToCloudinary(buffer, "hostel-overview/gallery");

    // Determine next order value
    const maxOrder = await prisma.hostelImage.aggregate({
      where: { hostelId: user.hostelId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const image = await prisma.hostelImage.create({
      data: { hostelId: user.hostelId, url: secure_url, publicId: public_id, caption, order },
    });

    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    console.error("Gallery upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}

// DELETE — remove an image by id (query param)
export async function DELETE(req: NextRequest) {
  try {
    const user = requireAdmin(req);
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Image id required" }, { status: 400 });

    const image = await prisma.hostelImage.findUnique({ where: { id } });
    if (!image || image.hostelId !== user.hostelId)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    await deleteFromCloudinary(image.publicId);
    await prisma.hostelImage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    if (error.message === "Unauthorized" || error.message?.startsWith("Forbidden"))
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
