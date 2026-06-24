import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/authGuard";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  try {
    const guard = await adminGuard(); if (guard) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }
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
