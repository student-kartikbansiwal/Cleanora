import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { generateOrderId } from "@/lib/utils";
import { z } from "zod";

const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
  shippingAddress: z.object({
    name: z.string().min(1),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/),
    country: z.string().default("India"),
  }),
  paymentMethod: z.enum(["razorpay", "upi", "cod"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
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
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const data = CreateOrderSchema.parse(body);

    // Fetch product details and validate stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of data.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product not found: ${item.productId}`,
          },
          { status: 404 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${product.name}`,
          },
          { status: 400 }
        );
      }

      const price = product.price;
      subtotal += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || "",
        price,
        quantity: item.quantity,
        sku: product.sku,
      });
    }

    // Apply coupon
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
      paymentStatus: data.paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "placed",
      notes: data.notes,
      statusHistory: [{ status: "placed", timestamp: new Date() }],
    });

    // Decrease stock
    for (const item of data.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: session.user.id },
      { items: [] }
    );

    return NextResponse.json(
      { success: true, order, orderId: order.orderId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
