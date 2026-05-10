import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import "@/lib/cloudinary"; // ensures cloudinary.config() is called

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only JPG, PNG, WebP, or PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size must be under 5 MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const isPdf = file.type === "application/pdf";

    // Upload to Cloudinary — use resource_type "auto" to handle both images & PDFs
    const result = await new Promise<{ secure_url: string; resource_type: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "student-documents", resource_type: "auto" },
          (error, res) => {
            if (error || !res) reject(error || new Error("Cloudinary upload failed"));
            else resolve({ secure_url: res.secure_url, resource_type: res.resource_type });
          }
        );
        stream.end(buffer);
      }
    );

    return NextResponse.json(
      { success: true, url: result.secure_url, resourceType: result.resource_type, isPdf },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
