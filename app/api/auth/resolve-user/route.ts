import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { internalApiGuard } from "@/lib/authGuard";

// Internal API called by NextAuth JWT callback to resolve Google users to MongoDB IDs
// Protected by X-Internal-Secret header
export async function POST(request: NextRequest) {
  const guard = internalApiGuard(request);
  if (guard) return guard;

  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user._id.toString(),
      role: user.role,
    });
  } catch (error) {
    console.error("Resolve user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to resolve user" },
      { status: 500 }
    );
  }
}
