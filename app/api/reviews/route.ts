import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { z } from "zod";

const ReviewSchema = z.object({
  productId: z.string().min(1, "Product ID required"),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3, "Title too short").max(100),
  body: z.string().min(10, "Review must be at least 10 characters").max(1000),
});

// GET /api/reviews?productId=xxx
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, message: "Valid product ID required" }, { status: 400 });
    }

    const reviews = await Review.find({ product: productId, status: "approved" })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Please sign in to write a review" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const data = ReviewSchema.parse(body);

    if (!mongoose.Types.ObjectId.isValid(data.productId)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 });
    }

    // Verify product exists
    const product = await Product.findById(data.productId);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: session.user.id,
      product: data.productId,
    });
    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this product" },
        { status: 409 }
      );
    }

    // Check if verified purchase
    const verifiedOrder = await Order.findOne({
      user: session.user.id,
      "items.product": data.productId,
      paymentStatus: "paid",
      orderStatus: { $in: ["confirmed", "processing", "shipped", "delivered"] },
    });

    const review = await Review.create({
      user: session.user.id,
      product: data.productId,
      rating: data.rating,
      title: data.title,
      body: data.body,
      isVerifiedPurchase: !!verifiedOrder,
      status: "pending", // Requires admin approval
    });

    return NextResponse.json(
      {
        success: true,
        review,
        message: "Thank you for your review! It will appear after approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    // Duplicate key (unique constraint)
    if (error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this product" },
        { status: 409 }
      );
    }
    console.error("Review POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to submit review" }, { status: 500 });
  }
}
