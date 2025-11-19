import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredAnonymousAccounts } from "@/app/_lib/anonymous-cleanup";

/**
 * API endpoint to cleanup expired anonymous accounts
 * This should be called periodically (daily at 2 AM UTC) by a cron service
 *
 *  Generate a CRON_SECRET:
 *    Option B (Node.js): node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
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
