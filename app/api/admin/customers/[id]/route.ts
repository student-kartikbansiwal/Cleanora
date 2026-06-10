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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const customer = await User.findById(id)
      .select("name email phone role isActive avatar isVerified createdAt lastLogin")
      .lean();

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    const orders = await Order.find({ user: id })
      .select("orderId totalAmount orderStatus paymentStatus paymentMethod items createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const totalSpent = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return NextResponse.json({
      success: true,
      customer,
      orders,
      stats: {
        orderCount: orders.length,
        totalSpent,
      },
    });
  } catch (error) {
    console.error("Admin customer detail GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}
