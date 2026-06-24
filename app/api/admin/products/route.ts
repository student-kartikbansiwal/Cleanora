import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/authGuard";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  shortDescription: z.string().min(10).max(300),
  price: z.number().positive(),
  comparePrice: z.number().optional(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  stock: z.number().int().min(0),
  sku: z.string().min(1),
  images: z.array(z.object({ url: z.string(), publicId: z.string(), alt: z.string().optional() })),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  usageGuide: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  volume: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const guard = await adminGuard(); if (guard) {
      return guard; }
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const filter = search ? { $text: { $search: search } } : {};
    const products = await Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await Product.countDocuments(filter);

    return NextResponse.json({ success: true, products, total, page, totalPages: Math.ceil(total / limit) });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await adminGuard(); if (guard) {
      return guard; }
    await dbConnect();
    const body = await request.json();
    const data = ProductSchema.parse(body);
    const slug = slugify(data.name);

    // Check duplicate slug
    const existing = await Product.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const product = await Product.create({ ...data, slug: finalSlug });
    await Category.findByIdAndUpdate(data.category, { $inc: { productCount: 1 } });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 });
  }
}
