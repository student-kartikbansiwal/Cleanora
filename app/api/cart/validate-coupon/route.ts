import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    const Coupon = (await import("@/models/Coupon")).default;
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired coupon code" },
        { status: 400 }
      );
    }

    const orderAmount = Number(subtotal) || 0;

    if (orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        success: true,
        discount: 0,
        message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon`,
      });
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = Math.round((orderAmount * coupon.value) / 100);
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = Math.min(coupon.value, orderAmount);
    }

    return NextResponse.json({
      success: true,
      discount,
      couponCode: coupon.code,
      description: coupon.description || `${coupon.value}${coupon.type === "percentage" ? "%" : "₹"} OFF`,
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
