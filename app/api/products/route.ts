import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { z } from "zod";

const ProductQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  sort: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  featured: z.string().optional(),
  bestSeller: z.string().optional(),
});

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "price",
  "averageRating",
  "soldCount",
  "name",
];

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const params = ProductQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const {
      page,
      limit,
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      sort,
      order,
      featured,
      bestSeller,
    } = params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };

    if (search && search.trim()) {
      const searchTerm = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { shortDescription: { $regex: searchTerm, $options: "i" } },
        { tags: { $regex: searchTerm, $options: "i" } },
        { sku: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (category) {
      const Category = (await import("@/models/Category")).default;
      const cat = await Category.findOne({ slug: category });
      if (!cat) {
        return NextResponse.json({
          success: true,
          products: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        });
      }
      filter.category = cat._id;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (rating) {
      filter.averageRating = { $gte: rating };
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    if (bestSeller === "true") {
      filter.isBestSeller = true;
    }

    const skip = (page - 1) * limit;
    const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : "createdAt";
    const sortObj: Record<string, 1 | -1> = {
      [sortField]: order === "asc" ? 1 : -1,
    };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
