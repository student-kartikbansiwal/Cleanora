import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
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
