import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── In-memory fallback for dev/CI (no Upstash configured) ──────────────────
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = inMemoryStore.get(key);

  if (!record || now > record.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  return {
    success: record.count <= limit,
    remaining,
    reset: record.resetAt,
  };
}

// ─── Upstash Redis rate limiter (production) ─────────────────────────────────
let upstashRatelimit: Ratelimit | null = null;

function getUpstashRatelimit(limit: number, window: string): Ratelimit {
  if (!upstashRatelimit) {
    const redis = Redis.fromEnv();
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window as `${number} ${"s" | "m" | "h" | "d"}`),
      analytics: true,
    });
  }
  return upstashRatelimit;
}

/**
 * Rate limiting middleware.
 * Uses Upstash Redis in production, falls back to in-memory in dev.
 *
 * @param request - NextRequest
 * @param identifier - Unique key prefix for the rate limit rule (e.g. "auth:validate")
 * @param limit - Max requests allowed in the window
 * @param window - Time window (e.g. "1m", "10s", "1h")
 * @returns NextResponse (429) if rate limited, or null to continue
 */
export async function rateLimit(
  request: NextRequest,
  identifier: string,
  limit: number,
  window: string
): Promise<NextResponse | null> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const key = `${identifier}:${ip}`;

  const hasUpstash =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

  let success: boolean;
  let remaining: number;
  let reset: number;

  if (hasUpstash) {
    try {
      const rl = getUpstashRatelimit(limit, window);
      const result = await rl.limit(key);
      success = result.success;
      remaining = result.remaining;
      reset = result.reset;
    } catch (err) {
      // If Upstash is unreachable, fall back to in-memory
      console.warn("[rateLimit] Upstash unavailable, using in-memory fallback:", err);
      const windowMs = parseWindowMs(window);
      const result = inMemoryRateLimit(key, limit, windowMs);
      success = result.success;
      remaining = result.remaining;
      reset = result.reset;
    }
  } else {
    // Dev / CI fallback
    const windowMs = parseWindowMs(window);
    const result = inMemoryRateLimit(key, limit, windowMs);
    success = result.success;
    remaining = result.remaining;
    reset = result.reset;
  }

  if (!success) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many requests. Please wait a moment and try again.",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  return null;
}

function parseWindowMs(window: string): number {
  const match = window.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 60_000;
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * (multipliers[unit] ?? 60_000);
}
