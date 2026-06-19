/**
 * In-memory per-IP rate limiter for Next.js Route Handlers.
 * Suitable for single-instance deployments. For multi-instance (e.g. Vercel
 * with multiple edge regions), replace the Map with an Upstash Redis store.
 */

const store = new Map();

/**
 * Returns a check function for the given window/limit config.
 * Call the returned function with an IP string on every request.
 *
 * @example
 * const check = rateLimit({ maxRequests: 10, windowMs: 15 * 60 * 1000 });
 * const result = check(ip);
 * if (!result.allowed) return 429;
 */
export function rateLimit({ maxRequests = 10, windowMs = 15 * 60 * 1000 } = {}) {
  return function check(ip) {
    const now  = Date.now();
    const key  = ip;
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return { allowed: false, remaining: 0, retryAfter };
    }

    entry.count += 1;
    return { allowed: true, remaining: maxRequests - entry.count };
  };
}

/** Extract the best-available client IP from a Next.js Request. */
export function getClientIp(req) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}
