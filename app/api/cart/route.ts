import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: true, cart: null, items: [] });
    }

    await dbConnect();
    const cart = await Cart.findOne({ user: session.user.id })
      .populate("items.product", "name slug price comparePrice images stock isActive")
      .lean();

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Please login to add items to cart" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { productId, quantity = 1 } = await request.json();

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, message: "Insufficient stock" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: session.user.id,
        items: [
          {
            product: product._id,
            quantity,
            price: product.price,
            name: product.name,
            image: product.images[0]?.url || "",
            sku: product.sku,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + quantity,
          product.stock
        );
      } else {
        cart.items.push({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          product: product._id as any,
          quantity,
          price: product.price,
          name: product.name,
          image: product.images[0]?.url || "",
          sku: product.sku,
        });
      }

      await cart.save();
    }

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { productId, quantity } = await request.json();

    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      const item = cart.items.find(
        (item) => item.product.toString() === productId
      );
      if (item) item.quantity = quantity;
    }

    await cart.save();
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error("Cart PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { productId } = await request.json();

    if (productId) {
      await Cart.findOneAndUpdate(
        { user: session.user.id },
        { $pull: { items: { product: productId } } }
      );
    } else {
      await Cart.findOneAndUpdate(
        { user: session.user.id },
        { items: [] }
      );
    }

    return NextResponse.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update cart" },
      { status: 500 }
    );
  }
}
