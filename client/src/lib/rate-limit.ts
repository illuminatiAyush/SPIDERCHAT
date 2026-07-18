const rateCache = new Map<string, { count: number, resetTime: number }>();

/**
 * Basic in-memory rate limiter for Next.js API Routes.
 * 
 * @param ip - The client identifier (IP address)
 * @param limit - Maximum requests allowed within the window
 * @param windowMs - The time window in milliseconds
 * @returns { success: boolean, remaining: number, resetTime: number }
 */
export function rateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = rateCache.get(ip);

  if (!record || record.resetTime < now) {
    rateCache.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetTime: record.resetTime };
}
