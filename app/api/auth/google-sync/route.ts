import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

// Internal API called by NextAuth Google signIn callback
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { user } = await request.json();

    const existing = await User.findOne({ email: user.email.toLowerCase() });
    let dbUser;

    if (!existing) {
      dbUser = await User.create({
        name: user.name,
        email: user.email.toLowerCase(),
        avatar: user.image,
        googleId: user.id,
        isVerified: true,
        role: user.email === process.env.ADMIN_EMAIL ? "admin" : "user",
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
