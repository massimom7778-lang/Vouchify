import 'server-only';

/**
 * A fixed-window counter, in process memory.
 *
 * The honest limitation: serverless runs many instances, so this bounds abuse
 * per instance rather than globally, and it resets on cold start. It is not a
 * substitute for a shared limiter at the edge. What it does do is stop one
 * client hammering a single instance into sending unbounded email, which is
 * the failure this endpoint actually has.
 */

interface Window {
  count: number;
  resetAt: number;
}

const globalState = globalThis as typeof globalThis & {
  __vouchifyRateLimit?: Map<string, Window>;
};

function buckets(): Map<string, Window> {
  if (!globalState.__vouchifyRateLimit) globalState.__vouchifyRateLimit = new Map();
  return globalState.__vouchifyRateLimit;
}

export interface RateLimitResult {
  readonly ok: boolean;
  readonly retryAfterSeconds: number;
}

export function rateLimit({
  key,
  limit,
  windowSeconds,
}: {
  key: string;
  limit: number;
  windowSeconds: number;
}): RateLimitResult {
  const now = Date.now();
  const map = buckets();

  // Opportunistic sweep so an instance that lives a long time does not hold
  // every key it has ever seen.
  if (map.size > 5_000) {
    for (const [existing, window] of map) {
      if (window.resetAt <= now) map.delete(existing);
    }
  }

  const window = map.get(key);
  if (!window || window.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, retryAfterSeconds: 0 };
  }

  window.count += 1;
  if (window.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((window.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/**
 * The client address, from the proxy headers Vercel sets. Falls back to a
 * constant so a missing header throttles as one shared bucket rather than
 * silently disabling the limit.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  return first || request.headers.get('x-real-ip') || 'unknown';
}
