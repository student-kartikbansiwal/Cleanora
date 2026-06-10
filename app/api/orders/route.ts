import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { generateOrderId } from "@/lib/utils";
import mongoose from "mongoose";
import { z } from "zod";

const CreateOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),
  shippingAddress: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid pincode"),
    country: z.string().default("India"),
  }),
  paymentMethod: z.enum(["razorpay", "upi", "cod"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid user session" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const orders = await Order.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments({ user: session.user.id });

    return NextResponse.json({
      success: true,
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Please sign in to place an order" },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      console.error("Invalid session user ID:", session.user.id);
      return NextResponse.json(
        { success: false, message: "Invalid user session. Please sign in again." },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const data = CreateOrderSchema.parse(body);

    const orderItems = [];
    let subtotal = 0;

    for (const item of data.items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return NextResponse.json(
          { success: false, message: `Invalid product ID: ${item.productId}` },
          { status: 400 }
        );
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not found` },
          { status: 404 }
        );
      }
      if (!product.isActive) {
        return NextResponse.json(
          { success: false, message: `${product.name} is no longer available` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
          },
          { status: 400 }
        );
      }

      const price = product.price;
      subtotal += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || "/placeholder-product.png",
        price,
        quantity: item.quantity,
        sku: product.sku,
      });
    }

    let discount = 0;
    if (data.couponCode) {
      const Coupon = (await import("@/models/Coupon")).default;
      const coupon = await Coupon.findOne({
        code: data.couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
      });

      if (coupon && subtotal >= coupon.minOrderAmount) {
        if (coupon.type === "percentage") {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscountAmount) {
            discount = Math.min(discount, coupon.maxDiscountAmount);
          }
        } else {
          discount = coupon.value;
        }
        await Coupon.findByIdAndUpdate(coupon._id, {
          $inc: { usedCount: 1 },
        });
      }
    }

    const shippingCharge = subtotal >= 499 ? 0 : 49;
    const totalAmount = subtotal - discount + shippingCharge;

    const order = await Order.create({
      orderId: generateOrderId(),
      user: session.user.id,
      items: orderItems,
      shippingAddress: data.shippingAddress,
      subtotal,
      shippingCharge,
      discount,
      couponCode: data.couponCode,
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: "pending",
      orderStatus: "placed",
      notes: data.notes,
      statusHistory: [{ status: "placed", timestamp: new Date() }],
    });

    for (const item of data.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    await Cart.findOneAndUpdate({ user: session.user.id }, { items: [] });

    console.log(`Order created: ${order.orderId} for user ${session.user.id}`);

    return NextResponse.json(
      {
        success: true,
        order,
        orderId: order.orderId,
        totalAmount: order.totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message || "Validation error";
      console.error("Order validation error:", error.issues);
      return NextResponse.json({ success: false, message }, { status: 400 });
    }
    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Order mongoose validation error:", error.message);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    console.error("Order POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
