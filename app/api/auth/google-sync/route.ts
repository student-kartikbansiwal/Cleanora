import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { internalApiGuard } from "@/lib/authGuard";

// Internal API called by NextAuth Google signIn callback
// Protected by X-Internal-Secret header
export async function POST(request: NextRequest) {
  const guard = internalApiGuard(request);
  if (guard) return guard;

  try {
    await dbConnect();
    const { user } = await request.json();

    if (!user?.email) {
      return NextResponse.json({ success: false, message: "Invalid user data" }, { status: 400 });
    }

    const existing = await User.findOne({ email: user.email.toLowerCase() });
    let dbUser;

    if (!existing) {
      dbUser = await User.create({
        name: user.name,
        email: user.email.toLowerCase(),
        avatar: user.image,
        googleId: user.id,
        isVerified: true,
        role:
          user.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()
            ? "admin"
            : "user",
      });
    } else {
      dbUser = await User.findByIdAndUpdate(
        existing._id,
        {
          googleId: user.id,
          avatar: user.image || existing.avatar,
          lastLogin: new Date(),
        },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      userId: dbUser!._id.toString(),
      role: dbUser!.role,
    });
  } catch (error) {
    console.error("Google sync error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
