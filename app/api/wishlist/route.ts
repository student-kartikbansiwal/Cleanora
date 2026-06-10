import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { z } from "zod";

const WishlistActionSchema = z.object({
  productId: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  action: z.enum(["add", "remove", "toggle", "sync"]),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const wishlist = await Wishlist.findOne({ user: session.user.id }).lean();
    if (!wishlist || wishlist.products.length === 0) {
      return NextResponse.json({ success: true, products: [], productIds: [] });
    }

    const products = await Product.find({
      _id: { $in: wishlist.products },
      isActive: true,
    })
      .select("name slug price comparePrice images averageRating reviewCount stock sku isBestSeller isFeatured")
      .lean();

    return NextResponse.json({
      success: true,
      products,
      productIds: products.map((p) => p._id.toString()),
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid user session" },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const data = WishlistActionSchema.parse(body);

    let wishlist = await Wishlist.findOne({ user: session.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: session.user.id,
        products: [],
      });
    }

    if (data.action === "sync" && data.productIds) {
      const validIds = data.productIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );
      const existingProducts = await Product.find({
        _id: { $in: validIds },
        isActive: true,
      }).select("_id");
      wishlist.products = existingProducts.map((p) => p._id);
      await wishlist.save();
    } else if (data.productId) {
      if (!mongoose.Types.ObjectId.isValid(data.productId)) {
        return NextResponse.json(
          { success: false, message: "Invalid product ID" },
          { status: 400 }
        );
      }

      const product = await Product.findOne({
        _id: data.productId,
        isActive: true,
      });
      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 }
        );
      }

      const productObjectId = new mongoose.Types.ObjectId(data.productId);
      const exists = wishlist.products.some((id) =>
        id.equals(productObjectId)
      );

      if (data.action === "add" && !exists) {
        wishlist.products.push(productObjectId);
      } else if (data.action === "remove" && exists) {
        wishlist.products = wishlist.products.filter(
          (id) => !id.equals(productObjectId)
        );
      } else if (data.action === "toggle") {
        if (exists) {
          wishlist.products = wishlist.products.filter(
            (id) => !id.equals(productObjectId)
          );
        } else {
          wishlist.products.push(productObjectId);
        }
      }

      await wishlist.save();
    }

    const products = await Product.find({
      _id: { $in: wishlist.products },
      isActive: true,
    })
      .select("name slug price comparePrice images averageRating reviewCount stock sku isBestSeller isFeatured")
      .lean();

    return NextResponse.json({
      success: true,
      products,
      productIds: products.map((p) => p._id.toString()),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Wishlist POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}
