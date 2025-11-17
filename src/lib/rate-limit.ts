// Simple in-memory rate limiter
// For production, use Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number;
}

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000, // 1 minute
): {
  success: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const key = identifier;

  // Clean up expired entries
  const entry = rateLimitStore.get(key);
  if (entry && entry.resetAt < now) {
    rateLimitStore.delete(key);
  }

  // Get or create entry
  const current = rateLimitStore.get(key) || {
    count: 0,
    resetAt: now + windowMs,
  };

  // Check if limit exceeded
  if (current.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  // Increment count
  current.count++;
  rateLimitStore.set(key, current);

  return {
    success: true,
    remaining: limit - current.count,
    resetAt: current.resetAt,
  };
}

// Helper to get client IP from request
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}
