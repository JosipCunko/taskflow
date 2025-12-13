import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

// Feature flags configuration
const FEATURE_FLAGS = {
  BETA_ANALYTICS: process.env.NODE_ENV === "production",
  ADVANCED_FITNESS: true,
  AI_FEATURES: true,
  OFFLINE_MODE: true,
};

// Security headers
const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

// Performance monitoring headers
function addPerformanceHeaders(request: NextRequest, response: NextResponse) {
  const startTime = Date.now();

  // Add timing headers
  response.headers.set("X-Request-Start-Time", startTime.toString());
  response.headers.set("X-Request-Pathname", request.nextUrl.pathname);
  response.headers.set("X-Request-Method", request.method);
  response.headers.set(
    "X-Request-User-Agent",
    request.headers.get("user-agent") || "unknown"
  );

  return response;
}

// Analytics and tracking headers
function addAnalyticsHeaders(request: NextRequest, response: NextResponse) {
  if (FEATURE_FLAGS.BETA_ANALYTICS) {
    response.headers.set("X-Analytics-Enabled", "true");
    response.headers.set("X-Page-View", request.nextUrl.pathname);
  }

  return response;
}

// Feature flag headers
function addFeatureFlagHeaders(
  request: NextRequest,
  response: NextResponse,
  token?: JWT | null
) {
  const userId = token?.sub;

  // Add feature flags based on user context
  if (FEATURE_FLAGS.ADVANCED_FITNESS) {
    response.headers.set("X-Feature-Advanced-Fitness", "true");
  }

  if (FEATURE_FLAGS.AI_FEATURES) {
    response.headers.set("X-Feature-AI", "true");
  }

  if (FEATURE_FLAGS.OFFLINE_MODE) {
    response.headers.set("X-Feature-Offline", "true");
  }

  // User-specific features (could be based on subscription tier)
  if (userId) {
    // Add beta features for specific users (you can implement user-based logic here)
    response.headers.set("X-Beta-User", "false"); // Placeholder for user-based beta flags
  }

  return response;
}

// Task privacy protection
function addTaskPrivacyHeaders(
  request: NextRequest,
  response: NextResponse,
  token?: JWT | null
) {
  if (request.nextUrl.pathname.startsWith("/webapp/tasks/")) {
    const taskId = request.nextUrl.pathname.split("/").pop();
    if (taskId && token?.sub) {
      // Add headers for server-side validation
      response.headers.set("X-Task-Access-Check", taskId);
    }
  }

  return response;
}

// Offline detection
function handleOfflineDetection(request: NextRequest): NextResponse | null {
  // Check for offline mode indicator (could come from service worker or client)
  const offlineMode =
    request.headers.get("x-offline-mode") === "true" ||
    request.nextUrl.searchParams.get("offline") === "true";

  if (offlineMode && request.nextUrl.pathname.startsWith("/webapp")) {
    return NextResponse.rewrite(new URL("/offline", request.url));
  }

  return null;
}

// Request filtering and optimization
function optimizeRequest(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  // Block common exploit attempts
  if (pathname.includes("..") || pathname.includes("\\")) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  // Handle CORS preflight requests more efficiently
  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return null;
}

export default withAuth(
  function middleware(request) {
    const { nextUrl, nextauth } = request;
    const token = nextauth?.token;
    const isAuthenticated = !!token;
    const pathname = nextUrl.pathname;

    // Handle offline detection first
    const offlineResponse = handleOfflineDetection(request);
    if (offlineResponse) return offlineResponse;

    // Request optimization and filtering
    const optimizedResponse = optimizeRequest(request);
    if (optimizedResponse) return optimizedResponse;

    // Authentication and route protection logic
    const isAuthPage = pathname.startsWith("/login");
    const isWebApp = pathname.startsWith("/webapp");
    const isApiProtected =
      pathname.startsWith("/api/admin") || pathname.startsWith("/api/user");

    // Redirect authenticated users away from login page
    if (isAuthPage && isAuthenticated) {
      return NextResponse.redirect(new URL("/webapp/today", request.url));
    }

    // Redirect unauthenticated users to login for protected routes
    if ((isWebApp || isApiProtected) && !isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Create response with all optimizations
    let response = NextResponse.next();

    // Add all security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add performance monitoring
    response = addPerformanceHeaders(request, response);

    // Add analytics and tracking
    response = addAnalyticsHeaders(request, response);

    // Add feature flags
    response = addFeatureFlagHeaders(request, response, token);

    // Add task privacy protection
    response = addTaskPrivacyHeaders(request, response, token);

    // Add cache control for static assets
    if (
      pathname.startsWith("/_next/static/") ||
      pathname.startsWith("/public/")
    ) {
      response.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
    }

    // Add server timing for performance monitoring
    response.headers.set(
      "Server-Timing",
      `middleware;dur=${
        Date.now() -
        parseInt(response.headers.get("X-Request-Start-Time") || "0")
      }`
    );

    return response;
  },
  {
    callbacks: {
      authorized: () => {
        // Let the middleware function handle all authorization logic
        // This gives us more control over redirects and responses
        return true;
      },
    },
  }
);

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    // Specifically include API routes for protection
    "/api/:path*",
    // Include webapp routes
    "/webapp/:path*",
    // Include auth pages
    "/login",
    // Include offline page
    "/offline",
  ],
};
