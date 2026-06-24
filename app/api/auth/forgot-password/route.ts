import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { rateLimit } from "@/lib/rateLimit";

// POST /api/auth/forgot-password — sends reset email via Resend (or SMTP fallback)
export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per IP per 15 minutes
  const rateLimitResult = await rateLimit(request, "auth:forgot-password", 5, "15m");
  if (rateLimitResult) return rateLimitResult;

  try {
    await dbConnect();
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a reset link has been sent.",
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token hash on user (never store plaintext)
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: tokenHash,
      resetPasswordExpiry: expiry,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px;">
        <div style="max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #00A86B, #008f5b); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🌿 Cleanora</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Clean Living, Better Living</p>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 16px;">Reset Your Password</h2>
            <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">Hi ${user.name},</p>
            <p style="color: #475569; line-height: 1.6; margin: 0 0 32px;">
              We received a request to reset your Cleanora account password. Click the button below to create a new password. This link will expire in <strong>1 hour</strong>.
            </p>
            <div style="text-align: center; margin: 0 0 32px;">
              <a href="${resetUrl}"
                 style="display: inline-block; background: #00A86B; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
              If you didn't request a password reset, please ignore this email. Your account is safe.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Or paste this link in your browser: <br/>
              <span style="word-break: break-all; color: #00A86B;">${resetUrl}</span>
            </p>
          </div>
          <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Cleanora. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    let emailSent = false;
    let emailError: string | null = null;

    // ── 1. Try Resend (preferred) ──────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Cleanora <onboarding@resend.dev>",
          to: user.email,
          subject: "Reset your Cleanora password",
          html: emailHtml,
        });
        if (result.error) {
          emailError = result.error.message;
          console.error("[ForgotPassword] Resend error:", result.error);
        } else {
          emailSent = true;
          console.info("[ForgotPassword] Email sent via Resend to:", user.email);
        }
      } catch (err) {
        emailError = err instanceof Error ? err.message : "Resend failed";
        console.error("[ForgotPassword] Resend exception:", err);
      }
    }

    // ── 2. Try SMTP/Nodemailer fallback (e.g. Gmail) ──────────────────────────
    if (!emailSent && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        await transporter.sendMail({
          from: `"Cleanora" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: "Reset your Cleanora password",
          html: emailHtml,
        });
        emailSent = true;
        console.info("[ForgotPassword] Email sent via SMTP to:", user.email);
      } catch (err) {
        emailError = err instanceof Error ? err.message : "SMTP failed";
        console.error("[ForgotPassword] SMTP exception:", err);
      }
    }

    // ── 3. Dev fallback — log to console + return token in response ───────────
    if (!emailSent) {
      console.info(`\n${"=".repeat(60)}`);
      console.info("[DEV] ⚠️  No email provider configured (RESEND_API_KEY or SMTP_USER+SMTP_PASS missing)");
      console.info("[DEV] Password reset URL for:", user.email);
      console.info("[DEV]", resetUrl);
      console.info("=".repeat(60) + "\n");
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent.",
      // In development: expose token + URL so devs can test without email
      ...(process.env.NODE_ENV === "development"
        ? {
            devResetUrl: resetUrl,
            devToken: token,
            emailSent,
            emailError: emailSent ? undefined : (emailError || "No email provider configured"),
          }
        : {}),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
