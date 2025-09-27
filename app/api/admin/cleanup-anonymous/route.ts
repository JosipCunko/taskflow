import { NextResponse } from "next/server";
import { cleanupExpiredAnonymousAccounts } from "@/app/_lib/anonymous-cleanup";

/**
 * API endpoint to cleanup expired anonymous accounts
 * This should be called periodically (every hour) by an external cron service
 * or can be triggered manually by administrators
 *
 * Security!!!: You should add authentication to this endpoint in production
 * For now, it's protected by a simple API key check
 */
export async function GET() {
  try {
    const results = await cleanupExpiredAnonymousAccounts();

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
