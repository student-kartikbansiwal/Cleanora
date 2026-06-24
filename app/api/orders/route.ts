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
  notes: z.string().max(500).optional(),
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));

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

    const mongooseInstance = await dbConnect();
    const body = await request.json();
    const data = CreateOrderSchema.parse(body);

    // ─── Pre-validation (outside transaction) ─────────────────────────────────
    const productIds = data.items.map((i) => i.productId);

    for (const productId of productIds) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return NextResponse.json(
          { success: false, message: `Invalid product ID: ${productId}` },
          { status: 400 }
        );
      }
    }

    // Fetch all products in a single query
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).lean();

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more products are unavailable" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let subtotal = 0;
    const orderItems: {
      product: mongoose.Types.ObjectId;
      name: string;
      image: string;
      price: number;
      quantity: number;
      sku: string;
    }[] = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not found: ${item.productId}` },
          { status: 404 }
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

      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id as mongoose.Types.ObjectId,
        name: product.name,
        image: product.images[0]?.url || "/placeholder-product.png",
        price: product.price,
        quantity: item.quantity,
        sku: product.sku,
      });
    }

    // ─── Coupon Pre-validation ────────────────────────────────────────────────
    let couponId: mongoose.Types.ObjectId | null = null;
    let discount = 0;

    if (data.couponCode) {
      const Coupon = (await import("@/models/Coupon")).default;

      // Re-fetch with proper filter
      const validCoupon = await Coupon.findOne({
        code: data.couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
      });

      if (!validCoupon) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired coupon code" },
          { status: 400 }
        );
      }

      if (validCoupon.usedCount >= validCoupon.usageLimit) {
        return NextResponse.json(
          { success: false, message: "Coupon usage limit has been reached" },
          { status: 400 }
        );
      }

      if (subtotal < validCoupon.minOrderAmount) {
        return NextResponse.json(
          {
            success: false,
            message: `Minimum order amount of ₹${validCoupon.minOrderAmount} required for this coupon`,
          },
          { status: 400 }
        );
      }

      if (validCoupon.type === "percentage") {
        discount = (subtotal * validCoupon.value) / 100;
        if (validCoupon.maxDiscountAmount) {
          discount = Math.min(discount, validCoupon.maxDiscountAmount);
        }
      } else {
        discount = Math.min(validCoupon.value, subtotal);
      }

      discount = Math.round(discount * 100) / 100;
      couponId = validCoupon._id;
    }

    const shippingCharge = subtotal - discount >= 499 ? 0 : 49;
    const totalAmount = subtotal - discount + shippingCharge;

    // ─── MongoDB Transaction (atomic stock + coupon + order) ──────────────────
    const dbConn = mongooseInstance.connection;
    const supportsTransactions = dbConn.readyState === 1 &&
      dbConn.db?.databaseName !== undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let order: any = null;

    if (supportsTransactions) {
      // Use a session for atomic operations (requires replica set / Atlas)
      const txSession = await mongoose.startSession();
      try {
        await txSession.withTransaction(async () => {
          // Atomically decrement stock for all items
          for (const item of data.items) {
            const updated = await Product.findOneAndUpdate(
              { _id: item.productId, stock: { $gte: item.quantity } },
              { $inc: { stock: -item.quantity, soldCount: item.quantity } },
              { new: true, session: txSession }
            );
            if (!updated) {
              throw new Error(`Insufficient stock for one or more products`);
            }
          }

          // Atomically increment coupon usage
          if (couponId) {
            const Coupon = (await import("@/models/Coupon")).default;
            const updatedCoupon = await Coupon.findOneAndUpdate(
              { _id: couponId, usedCount: { $lt: (await Coupon.findById(couponId, null, { session: txSession }))!.usageLimit } },
              { $inc: { usedCount: 1 } },
              { new: true, session: txSession }
            );
            if (!updatedCoupon) {
              throw new Error("Coupon usage limit reached");
            }
          }


          // Create the order
          const newOrder = new Order({
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
          await newOrder.save({ session: txSession });
          order = newOrder;


          // Clear the cart
          await Cart.findOneAndUpdate(
            { user: session.user.id },
            { items: [] },
            { session: txSession }
          );
        });
      } finally {
        await txSession.endSession();
      }
    } else {
      // Fallback: non-transactional (single-node dev MongoDB)
      // Still uses atomic findOneAndUpdate with stock guard
      for (const item of data.items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity, soldCount: item.quantity } },
          { new: true }
        );
        if (!updated) {
          return NextResponse.json(
            { success: false, message: "Some items went out of stock. Please refresh your cart." },
            { status: 400 }
          );
        }
      }

      if (couponId) {
        const Coupon = (await import("@/models/Coupon")).default;
        const updatedCoupon = await Coupon.findOneAndUpdate(
          { _id: couponId, usedCount: { $lt: (await Coupon.findById(couponId))!.usageLimit } },
          { $inc: { usedCount: 1 } },
          { new: true }
        );
        if (!updatedCoupon) {
          // Race condition — restore stock
          for (const item of data.items) {
            await Product.findOneAndUpdate(
              { _id: item.productId },
              { $inc: { stock: item.quantity, soldCount: -item.quantity } }
            );
          }
          return NextResponse.json(
            { success: false, message: "Coupon usage limit has been reached" },
            { status: 400 }
          );
        }
      }

      order = await Order.create({
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

      await Cart.findOneAndUpdate({ user: session.user.id }, { items: [] });
    }

    if (!order) {
      throw new Error("Order creation failed");
    }

    console.log(`[Order] Created: ${(order as { orderId: string }).orderId} for user ${session.user.id}`);

    return NextResponse.json(
      {
        success: true,
        order,
        orderId: (order as { orderId: string }).orderId,
        totalAmount: (order as { totalAmount: number }).totalAmount,
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
    const msg = error instanceof Error ? error.message : "Failed to create order";
    console.error("Order POST error:", error);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
