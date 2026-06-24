import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/authGuard";
import dbConnect from "@/lib/db";
import Coupon from "@/models/Coupon";
import { z } from "zod";

const CouponCreateSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20).toUpperCase().trim(),
  type: z.enum(["percentage", "flat"]),
  value: z.number().positive("Value must be positive"),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscountAmount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().default(100),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional(),
});

// GET /api/admin/coupons
export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search") || "";

    const filter: Record<string, unknown> = {};
    if (search) {
      // Sanitize search to prevent regex injection
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.code = { $regex: escapedSearch, $options: "i" };
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      coupons,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin coupons GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons
export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await dbConnect();
    const body = await request.json();
    const data = CouponCreateSchema.parse(body);

    if (new Date(data.validTo) <= new Date(data.validFrom)) {
      return NextResponse.json(
        { success: false, message: "Valid To must be after Valid From" },
        { status: 400 }
      );
    }

    if (data.type === "percentage" && data.value > 100) {
      return NextResponse.json(
        { success: false, message: "Percentage discount cannot exceed 100%" },
        { status: 400 }
      );
    }

    const existing = await Coupon.findOne({ code: data.code });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists" },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create({
      ...data,
      validFrom: new Date(data.validFrom),
      validTo: new Date(data.validTo),
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Admin coupons POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
