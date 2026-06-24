import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/authGuard";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";

// GET /api/admin/categories — returns all active categories for dropdowns
export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true })
      .select("_id name slug")
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    return NextResponse.json({ success: true, categories });
  } catch (_error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
