import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import mongoose from "mongoose";

async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email phone role isActive avatar createdAt lastLogin")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Aggregate order stats for the users on this page
    const userIds = users.map((u) => u._id as mongoose.Types.ObjectId);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
            },
          },
        },
      },
    ]);

    const statsMap = new Map(
      orderStats.map((s) => [
        s._id.toString(),
        { orderCount: s.orderCount, totalSpent: s.totalSpent },
      ])
    );

    const customers = users.map((u) => {
      const stats = statsMap.get((u._id as mongoose.Types.ObjectId).toString());
      return {
        ...u,
        orderCount: stats?.orderCount || 0,
        totalSpent: stats?.totalSpent || 0,
      };
    });

    return NextResponse.json({
      success: true,
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin customers GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
