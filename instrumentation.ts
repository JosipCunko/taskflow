/**
 * Next.js Instrumentation for performance monitoring
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * This file runs once when the server starts (or during build for edge runtime)
 * Use it for:
 * - Performance monitoring setup
 * - Error tracking initialization
 * - Database connection pooling
 * - Feature flag initialization
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side instrumentation
    console.log("[Instrumentation] Server runtime initialized");

    // Example: Initialize performance monitoring
    // await initPerformanceMonitoring();

    // Example: Setup error tracking
    // await initErrorTracking();

    // Example: Warm up database connections
    // await warmupDatabaseConnections();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime instrumentation
    console.log("[Instrumentation] Edge runtime initialized");
  }
}

export async function onRequestError(
  err: Error,
  request: {
    path: string;
    method: string;
    headers: Headers;
  }
) {
  // Log errors for monitoring
  console.error("[Request Error]", {
    error: err.message,
    path: request.path,
    method: request.method,
    timestamp: new Date().toISOString(),
  });

  // Example: Send to error tracking service
  // await sendErrorToTracking(err, request);
}
