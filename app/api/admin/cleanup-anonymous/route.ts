import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredAnonymousAccounts } from "@/app/_lib/anonymous-cleanup";

/**
 * API endpoint to cleanup expired anonymous accounts
 * This should be called periodically (every hour) by a cron service
 * 
 * For Vercel deployments:
 * - Configured in vercel.json with cron schedule
 * - Protected by CRON_SECRET environment variable
 * 
 * For other deployments:
 * - Set up an external cron service (e.g., cron-job.org, EasyCron)
 * - Add CRON_SECRET to environment variables
 * - Call this endpoint every hour
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Verify the request is from a trusted source
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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
