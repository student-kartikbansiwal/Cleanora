import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Shared auth guard helpers — centralise admin and internal-call protection.
 * Import from here instead of duplicating isAdmin() in every route.
 */

// ─── Admin Role Guard ─────────────────────────────────────────────────────────

/** Returns the session if the current user is an admin, otherwise null. */
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

/**
 * Guard function for admin API routes.
 * Returns a 403 NextResponse if not admin, otherwise null.
 *
 * Usage:
 *   const guard = await adminGuard();
 *   if (guard) return guard;
 */
export async function adminGuard(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }
  return null;
}

// ─── Internal API Guard ───────────────────────────────────────────────────────

/**
 * Guard for internal-only API routes (called server-side by NextAuth).
 * Validates that the request includes the INTERNAL_API_SECRET header.
 * Returns a 403 NextResponse if the secret is missing or wrong.
 *
 * Usage:
 *   const guard = internalApiGuard(request);
 *   if (guard) return guard;
 */
export function internalApiGuard(request: NextRequest): NextResponse | null {
  const secret = request.headers.get("x-internal-secret");
  const expected = process.env.INTERNAL_API_SECRET;

  if (!expected) {
    // In dev mode without the secret set, allow but warn
    if (process.env.NODE_ENV === "development") {
      console.warn("[authGuard] INTERNAL_API_SECRET not set — skipping guard in dev");
      return null;
    }
    return NextResponse.json(
      { success: false, message: "Server configuration error" },
      { status: 500 }
    );
  }

  if (!secret || secret !== expected) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }
  return null;
}

// ─── User Session Guard ───────────────────────────────────────────────────────

/**
 * Guard for authenticated user routes.
 * Returns a 401 NextResponse if not authenticated.
 */
export async function userGuard(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  return null;
}
