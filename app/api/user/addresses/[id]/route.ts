import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Address from "@/models/Address";
import mongoose from "mongoose";
import { z } from "zod";

const UpdateAddressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]).optional(),
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  street: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/).optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// PUT /api/user/addresses/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid address ID" }, { status: 400 });
    }

    const body = await request.json();
    const data = UpdateAddressSchema.parse(body);

    // Check ownership
    const address = await Address.findOne({ _id: id, user: session.user.id });
    if (!address) {
      return NextResponse.json({ success: false, message: "Address not found" }, { status: 404 });
    }

    // If setting as default, unset others first
    if (data.isDefault) {
      await Address.updateMany({ user: session.user.id, _id: { $ne: id } }, { isDefault: false });
    }

    await Address.findByIdAndUpdate(id, data, { new: true });

    const addresses = await Address.find({ user: session.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("PUT address error:", error);
    return NextResponse.json({ success: false, message: "Failed to update address" }, { status: 500 });
  }
}

// DELETE /api/user/addresses/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid address ID" }, { status: 400 });
    }

    // Check ownership
    const address = await Address.findOne({ _id: id, user: session.user.id });
    if (!address) {
      return NextResponse.json({ success: false, message: "Address not found" }, { status: 404 });
    }

    const wasDefault = address.isDefault;
    await Address.findByIdAndDelete(id);

    // If deleted address was default, make the most recent one default
    if (wasDefault) {
      const remaining = await Address.findOne({ user: session.user.id }).sort({ createdAt: -1 });
      if (remaining) {
        await Address.findByIdAndUpdate(remaining._id, { isDefault: true });
      }
    }

    const addresses = await Address.find({ user: session.user.id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("DELETE address error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete address" }, { status: 500 });
  }
}
