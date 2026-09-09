import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredAnonymousAccounts } from "@/app/_lib/anonymous-cleanup";

/**
 * API endpoint to cleanup expired anonymous accounts.
 * Pinged every 3 hours by cron-job.org (Vercel Hobby cron is once/day only).
 *
 * Authenticated with CRON_SECRET (not a user session). Generate one with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
export async function GET(request: NextRequest) {
  return handleAnonymousCleanup(request);
}

export async function POST(request: NextRequest) {
  return handleAnonymousCleanup(request);
}

async function handleAnonymousCleanup(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET is not configured on the server");
      return NextResponse.json(
        { error: "Server misconfigured - missing CRON_SECRET" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("Unauthorized cleanup attempt - invalid secret");
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing CRON_SECRET" },
        { status: 401 }
      );
    }

    console.log("Starting anonymous accounts cleanup...");
    const results = await cleanupExpiredAnonymousAccounts();

    console.log(`Cleanup completed: ${results.deletedCount} accounts deleted`);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      deletedCount: results.deletedCount,
      errors: results.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cleanup API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
