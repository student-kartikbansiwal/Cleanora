import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

// Internal API called by NextAuth Google signIn callback
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { user } = await request.json();

    const existing = await User.findOne({ email: user.email });
    if (!existing) {
      await User.create({
        name: user.name,
        email: user.email,
        avatar: user.image,
        googleId: user.id,
        isVerified: true,
        role: user.email === process.env.ADMIN_EMAIL ? "admin" : "user",
      });
    } else {
      await User.findByIdAndUpdate(existing._id, {
        googleId: user.id,
        avatar: user.image || existing.avatar,
        lastLogin: new Date(),
      });
    }
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
