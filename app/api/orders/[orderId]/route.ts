import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

// GET /api/orders/[orderId] — get single order
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { orderId } = await params;

    const order = await Order.findOne({
      // Allow either the orderId string or MongoDB _id
      $or: [{ orderId }, { _id: orderId.length === 24 ? orderId : null }],
      user: session.user.id,
    }).lean();

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/orders/[orderId] — cancel order
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { orderId } = await params;
    const { action } = await req.json();

    const order = await Order.findOne({ orderId, user: session.user.id });
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (action === "cancel") {
      if (!["placed", "confirmed"].includes(order.orderStatus)) {
        return NextResponse.json(
          { success: false, message: "Order cannot be cancelled at this stage" },
          { status: 400 }
        );
      }
      order.orderStatus = "cancelled";
      await order.save();
    }

    return NextResponse.json({ success: true, order });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "Failed to update order" }, { status: 500 });
  }
}
