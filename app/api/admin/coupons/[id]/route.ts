import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";
import { adminGuard } from "@/lib/authGuard";
import mongoose from "mongoose";
import { z } from "zod";

// Strict validation — prevents NoSQL injection from raw body spread
const UpdateCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase().trim().optional(),
  type: z.enum(["percentage", "flat"]).optional(),
  value: z.number().positive().optional(),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validTo: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(500).optional(),
}).strict(); // .strict() rejects unknown keys

// PUT /api/admin/coupons/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = UpdateCouponSchema.parse(body);

    // Additional business validation
    if (data.type === "percentage" && data.value !== undefined && data.value > 100) {
      return NextResponse.json(
        { success: false, message: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      );
    }

    if (data.validFrom && data.validTo && new Date(data.validTo) <= new Date(data.validFrom)) {
      return NextResponse.json(
        { success: false, message: "Valid To must be after Valid From" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.validFrom) updateData.validFrom = new Date(data.validFrom);
    if (data.validTo) updateData.validTo = new Date(data.validTo);

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Admin coupon PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coupons/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon ID" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    console.error("Admin coupon DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
