import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
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
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      await request.json();

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
      { orderId },
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
