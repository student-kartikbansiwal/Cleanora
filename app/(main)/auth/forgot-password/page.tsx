"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  // Only present in development when no email provider is configured
  devResetUrl?: string;
  devToken?: string;
  emailSent?: boolean;
  emailError?: string;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devInfo, setDevInfo] = useState<Pick<ForgotPasswordResponse, "devResetUrl" | "emailSent" | "emailError"> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data: ForgotPasswordResponse = await res.json();

      if (data.success) {
        setSent(true);
        // In development: capture the dev reset URL to show on-screen
        if (data.devResetUrl) {
          setDevInfo({
            devResetUrl: data.devResetUrl,
            emailSent: data.emailSent,
            emailError: data.emailError,
          });
        }
      } else {
        toast.error(data.message || "Failed to send reset email");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl border border-border shadow-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-navy-700 mb-2">Check your email!</h2>
              <p className="text-muted-foreground text-sm mb-6">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
                Check your inbox and spam folder.
              </p>

              {/* Dev Mode Banner — only shown when no email provider is configured */}
              {devInfo && !devInfo.emailSent && devInfo.devResetUrl && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 font-semibold text-sm">Development Mode</p>
                      <p className="text-amber-700 text-xs mt-0.5">
                        No email provider configured. Click below to use your reset link directly:
                        {devInfo.emailError && (
                          <span className="block mt-1 text-red-600">Error: {devInfo.emailError}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <a
                    href={devInfo.devResetUrl}
                    className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <ExternalLink size={14} />
                    Open Reset Link
                  </a>
                  <p className="text-amber-600 text-xs mt-2 text-center">
                    To enable real emails, add <code className="font-mono bg-amber-100 px-1 rounded">RESEND_API_KEY</code> to your <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code>
                  </p>
                </div>
              )}

              <Link href="/auth/login" className="btn-primary w-full flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-navy-700">Forgot Password?</h1>
                <p className="text-muted-foreground text-sm mt-2">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-navy-700 transition-colors"
                >
                  <ArrowLeft size={15} /> Back to Login
                </Link>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
