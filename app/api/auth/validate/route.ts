import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

// Internal API called by NextAuth credentials provider
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, message: "No account found with this email" });
    }
    if (!user.password) {
      return NextResponse.json({ success: false, message: "Please use Google to sign in" });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid password" });
    }
    if (!user.isActive) {
      return NextResponse.json({ success: false, message: "Account deactivated" });
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.avatar,
        role: user.role,
      },
    });
  } catch (_error) {
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 });
  }
}
