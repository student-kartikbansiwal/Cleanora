import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      await request.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return NextResponse.json(
        { success: false, message: "Missing required payment fields" },
        { status: 400 }
      );
    }

    // SECURITY: Verify the order belongs to the authenticated user
    const order = await Order.findOne({ orderId, user: session.user.id });
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

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    await Order.findOneAndUpdate(
      { orderId, user: session.user.id },
      {
        paymentStatus: "paid",
        orderStatus: "confirmed",
        razorpayPaymentId,
        razorpaySignature,
        $push: {
          statusHistory: { status: "confirmed", timestamp: new Date() },
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    );
  }
}
