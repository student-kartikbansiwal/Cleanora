import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findOne({
      orderId,
      user: session.user.id,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { success: false, message: "Order is already paid" },
        { status: 400 }
      );
    }

    const amount = order.totalAmount;

    const razorpayOrder = await createRazorpayOrder(
      amount,
      "INR",
      `CLN-${orderId}`
    );

    await Order.findOneAndUpdate(
      { orderId },
      { razorpayOrderId: razorpayOrder.id }
    );

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create payment" },
      { status: 500 }
    );
  }
}
