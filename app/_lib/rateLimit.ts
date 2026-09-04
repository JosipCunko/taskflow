import "server-only";

/* 
Note: this is process-local memory (no new dependency needed), so on a multi-instance serverless deployment each instance enforces its own limit rather than one global counter — but it directly stops the "one IP hammering the endpoint" scenario you're worried about. If you deploy across many concurrent instances and want a truly global limit, that would need a shared store like Redis (e.g. Upstash) 
*/

interface RateLimitWindow {
  count: number;
  windowStart: number;
}

// Sustained limit: protects the monthly/organization-level Thesys spend cap.
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 8;

// Burst limit: stops rapid-fire scripted spam (double-clicks, bots, etc.)
const BURST_WINDOW_MS = 10 * 1000; // 10 seconds
const MAX_BURST_REQUESTS = 3;

// Process-local stores. Good enough for a single-instance/low-traffic app;
// on multi-instance serverless deployments each instance enforces its own
// limit, which still stops the common "one IP hammering the endpoint" case.
const sustainedStore = new Map<string, RateLimitWindow>();
const burstStore = new Map<string, RateLimitWindow>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of sustainedStore) {
    if (now - entry.windowStart > WINDOW_MS * 2) sustainedStore.delete(key);
  }
  for (const [key, entry] of burstStore) {
    if (now - entry.windowStart > BURST_WINDOW_MS * 2) burstStore.delete(key);
  }
}

function checkWindow(
  store: Map<string, RateLimitWindow>,
  key: string,
  windowMs: number,
  maxRequests: number,
  now: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count < maxRequests) {
    entry.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((entry.windowStart + windowMs - now) / 1000),
    ),
  };
}

/**
 * Basic in-memory IP rate limiter used to protect the Thesys AI endpoint
 * from abuse. Applies two layered limits per IP:
 *  - Burst: at most `MAX_BURST_REQUESTS` requests per `BURST_WINDOW_MS`
 *  - Sustained: at most `MAX_REQUESTS_PER_WINDOW` requests per `WINDOW_MS`
 *
 * This is intentionally cheap (no external store) since it just needs to
 * stop a single IP from repeatedly hitting a paid, credit-limited API.
 */
export function checkIpRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  cleanupStaleEntries(now);

  const burst = checkWindow(
    burstStore,
    ip,
    BURST_WINDOW_MS,
    MAX_BURST_REQUESTS,
    now,
  );
  if (!burst.allowed) return burst;

  return checkWindow(
    sustainedStore,
    ip,
    WINDOW_MS,
    MAX_REQUESTS_PER_WINDOW,
    now,
  );
}

/** Extracts the best-effort client IP from standard proxy headers. */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
