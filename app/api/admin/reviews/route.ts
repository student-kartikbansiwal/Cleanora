import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/authGuard";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import mongoose from "mongoose";

// GET /api/admin/reviews
export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status") || "";

    const filter: Record<string, string> = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email")
        .populate("product", "name slug images")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reviews — moderate review
export async function PATCH(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await dbConnect();
    const { id, status } = await request.json();

    if (!id || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    // Recompute product rating when approval status changes
    if (status === "approved" || status === "rejected") {
      const Product = (await import("@/models/Product")).default;
      const stats = await Review.aggregate([
        { $match: { product: review.product, status: "approved" } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ]);
      await Product.findByIdAndUpdate(review.product, {
        averageRating: stats[0]?.averageRating
          ? Math.round(stats[0].averageRating * 10) / 10
          : 0,
        reviewCount: stats[0]?.reviewCount || 0,
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Admin review PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews?id=xxx
export async function DELETE(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Admin review DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete review" },
      { status: 500 }
    );
  }
}
