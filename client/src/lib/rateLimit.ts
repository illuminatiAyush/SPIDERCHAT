import { LRUCache } from "lru-cache";
import { NextRequest } from "next/server";

const tokenCache = new LRUCache({
  max: 500,
  ttl: 60000, // 1 minute
});

export function rateLimit(req: NextRequest, limit: number, windowMs: number) {
  // Get IP from headers (works for Vercel/proxies)
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
  const route = req.nextUrl.pathname;
  const key = `${ip}-${route}`;

  const tokenCount = (tokenCache.get(key) as number[]) || [0];
  if (tokenCount[0] === 0) {
    tokenCache.set(key, tokenCount);
  }
  tokenCount[0] += 1;

  const currentUsage = tokenCount[0];
  const isRateLimited = currentUsage > limit;

  return { isRateLimited, currentUsage, limit };
}
