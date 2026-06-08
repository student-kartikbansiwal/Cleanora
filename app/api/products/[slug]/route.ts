import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;

    const product = await Product.findOne({ slug, isActive: true })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch related products
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productAny = product as any;
    const related = await Product.find({
      category: productAny.category?._id,
      _id: { $ne: productAny._id },
      isActive: true,
    })
      .limit(4)
      .select("name slug price comparePrice images averageRating reviewCount")
      .lean();

    return NextResponse.json({ success: true, product, related });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
