import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";

// Ideally use a DB model for tokens - we'll use a simple in-memory approach
// with a metadata field on user for MVP. Real production should use Redis or a separate Token model.

// GET /api/auth/forgot-password — validates token
// POST /api/auth/forgot-password — sends reset email

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true, message: "If an account exists, a reset link has been sent." });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token hash on user (don't store plaintext)
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: tokenHash,
      resetPasswordExpiry: expiry,
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    // Send email if SMTP configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        // nodemailer is optional — install it with: npm install nodemailer @types/nodemailer
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Cleanora" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: "Reset your Cleanora password",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #00A86B;">Reset Your Password</h2>
              <p>Hi ${user.name},</p>
              <p>You requested to reset your Cleanora account password. Click the button below:</p>
              <a href="${resetUrl}" style="display: inline-block; background: #00A86B; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
                Reset Password
              </a>
              <p style="color: #888; font-size: 13px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
              <p style="color: #888; font-size: 12px;">Or copy this link: ${resetUrl}</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Don't reveal email errors to client
      }
    } else {
      // Log reset URL for development
      console.info(`[DEV] Password reset URL for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent.",
      // Only expose token in development for testing
      ...(process.env.NODE_ENV === "development" ? { devToken: token } : {}),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, message: "Failed to process request" }, { status: 500 });
  }
}
