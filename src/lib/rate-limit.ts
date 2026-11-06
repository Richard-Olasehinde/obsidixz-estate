/**
 * In-memory fixed-window rate limiter.
 *
 * WHY IN MEMORY
 * An eight-page brochure site with a single form does not justify a database or
 * a Redis instance. The limiter exists to stop casual repeat submission, not to
 * provide a hard security boundary.
 *
 * LIMITATIONS, STATED OPENLY
 * - The counter lives in the server process: it resets on restart/redeploy.
 * - On a multi-instance deployment each instance counts separately, so the
 *   effective limit is per instance.
 * - It keys on a client IP, which can be shared (office NAT) or spoofed at the
 *   edge. It is one layer among several, not a guarantee.
 *
 * If abuse becomes a real problem, swap this module for a durable store; the
 * interface (`checkRateLimit`) is deliberately small enough to replace.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const MAX_ENTRIES = 5000;

function evictIfNeeded(now: number) {
  if (buckets.size <= MAX_ENTRIES) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // Still too large: drop oldest insertions (Map preserves insertion order).
  while (buckets.size > MAX_ENTRIES) {
    const oldest = buckets.keys().next();
    if (oldest.done) break;
    buckets.delete(oldest.value);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

export function checkRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    evictIfNeeded(now);
    return { allowed: true, remaining: Math.max(0, max - 1), retryAfter: Math.ceil(windowMs / 1000) };
  }

  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, max - existing.count),
    retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

/** Test helper — not used by the application. */
export function _resetRateLimits() {
  buckets.clear();
}
