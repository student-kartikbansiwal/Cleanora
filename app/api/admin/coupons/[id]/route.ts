import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";
import mongoose from "mongoose";

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

// PUT /api/admin/coupons/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid coupon ID" }, { status: 400 });
    }

    const body = await request.json();
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        ...body,
        validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
        validTo: body.validTo ? new Date(body.validTo) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error("Admin coupon PUT error:", error);
    return NextResponse.json({ success: false, message: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid coupon ID" }, { status: 400 });
    }

    await Coupon.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    console.error("Admin coupon DELETE error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete coupon" }, { status: 500 });
  }
}
