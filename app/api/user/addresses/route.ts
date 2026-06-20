import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Address from "@/models/Address";
import mongoose from "mongoose";
import { z } from "zod";

const AddressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]).default("Home"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid pincode"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

// GET /api/user/addresses
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const addresses = await Address.find({ user: session.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("GET addresses error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch addresses" }, { status: 500 });
  }
}

// POST /api/user/addresses
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const data = AddressSchema.parse(body);

    // Enforce max 5 addresses per user
    const count = await Address.countDocuments({ user: session.user.id });
    if (count >= 5) {
      return NextResponse.json(
        { success: false, message: "Maximum 5 addresses allowed. Please delete one first." },
        { status: 400 }
      );
    }

    // If setting as default, unset others first
    if (data.isDefault) {
      await Address.updateMany({ user: session.user.id }, { isDefault: false });
    }

    // If this is the first address, make it default
    const isFirst = count === 0;

    await Address.create({
      user: session.user.id,
      ...data,
      isDefault: data.isDefault || isFirst,
    });

    const addresses = await Address.find({ user: session.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, addresses }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("POST address error:", error);
    return NextResponse.json({ success: false, message: "Failed to add address" }, { status: 500 });
  }
}
