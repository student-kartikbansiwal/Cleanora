"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration. Please try again later.",
  AccessDenied: "Access denied. You do not have permission to sign in.",
  Verification: "The sign-in link is no longer valid. It may have expired or already been used.",
  OAuthSignin: "Could not start the sign-in with the provider. Please try again.",
  OAuthCallback: "Sign-in with the provider failed. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method. Use your original method.",
  CredentialsSignin: "Invalid email or password. Please try again.",
  Default: "Something went wrong while signing you in. Please try again.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border shadow-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={30} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-navy-700 mb-2">Sign-in Error</h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/login" className="btn-primary py-2.5 px-5 inline-flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Login
          </Link>
          <Link href="/" className="btn-outline py-2.5 px-5 inline-flex items-center justify-center gap-2">
            <Home size={16} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
