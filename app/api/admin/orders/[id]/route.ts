import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/authGuard";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await dbConnect();
    const { id } = await params;
    const order = await Order.findById(id).populate("user", "name email phone").lean();
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await adminGuard();
  if (guard) return guard;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const allowedFields = ["orderStatus", "paymentStatus", "trackingNumber", "estimatedDelivery", "notes"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in body) update[key] = body[key];
    }

    const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "Failed to update order" }, { status: 500 });
  }
}
