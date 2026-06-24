import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { internalApiGuard } from "@/lib/authGuard";
import { rateLimit } from "@/lib/rateLimit";

// Internal API called by NextAuth credentials provider
// Protected by X-Internal-Secret header + rate limiting
export async function POST(request: NextRequest) {
  // Rate limit: 10 attempts per IP per minute
  const rateLimitResult = await rateLimit(request, "auth:validate", 10, "1m");
  if (rateLimitResult) return rateLimitResult;

  // Guard: only allow calls from NextAuth server-side (with secret header)
  const guard = internalApiGuard(request);
  if (guard) return guard;

  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    // Generic error to prevent account enumeration
    if (!user || !user.password) {
      // Still run bcrypt-like timing to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 200));
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Account has been deactivated. Please contact support.",
        },
        { status: 403 }
      );
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.avatar || null,
        role: user.role,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}
