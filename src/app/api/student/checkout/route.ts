import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { notifyHostelAdmins } from "@/lib/notifications";

// POST: Request checkout
export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    const { reason } = await request.json().catch(() => ({ reason: undefined }));

    const student = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json({ success: false, error: "Only student accounts can request checkout" }, { status: 403 });
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.checkoutRequest.findUnique({
      where: { userId: student.id },
    });

    if (existingRequest && existingRequest.status === "PENDING") {
      return NextResponse.json({ success: false, error: "You already have a pending checkout request" }, { status: 400 });
    }

    // Upsert the checkout request
    const checkoutRequest = await prisma.checkoutRequest.upsert({
      where: { userId: student.id },
      update: {
        reason: reason || null,
        status: "PENDING",
      },
      create: {
        userId: student.id,
        hostelId: student.hostelId,
        reason: reason || null,
        status: "PENDING",
      },
    });

    // Notify admins
    await notifyHostelAdmins(
      student.hostelId,
      "CHECKOUT_REQUEST_PENDING",
      "Checkout Request",
      `${student.name} has requested permanent checkout.`,
      "/admin/checkout"
    );

    return NextResponse.json({
      success: true,
      message: "Checkout request submitted successfully. Awaiting admin approval.",
      data: checkoutRequest,
    });
  } catch (error) {
    console.error("Checkout request error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }
}

// GET: Check checkout request status
export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const checkoutRequest = await prisma.checkoutRequest.findUnique({
      where: { userId: user.userId },
    });

    return NextResponse.json({ success: true, data: checkoutRequest });
  } catch (error) {
    console.error("Checkout check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }
}

// DELETE: Cancel checkout request
export async function DELETE(request: NextRequest) {
  try {
    const user = requireAuth(request);

    const existingRequest = await prisma.checkoutRequest.findUnique({
      where: { userId: user.userId },
    });

    if (!existingRequest || existingRequest.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "No pending checkout request to cancel" }, { status: 400 });
    }

    await prisma.checkoutRequest.delete({
      where: { id: existingRequest.id },
    });

    return NextResponse.json({
      success: true,
      message: "Checkout request cancelled successfully.",
    });
  } catch (error) {
    console.error("Checkout cancel error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    const status = errorMessage.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: errorMessage }, { status });
  }
}
