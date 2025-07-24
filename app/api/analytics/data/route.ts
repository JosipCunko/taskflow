import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getAnalyticsData } from "@/app/_lib/analytics-admin";
import { adminDb } from "@/app/_lib/admin";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get analytics data
    const analyticsData = await getAnalyticsData(session.user.id);

    // Get session count for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sessionsSnapshot = await adminDb
      .collection("userSessions")
      .where("userId", "==", session.user.id)
      .where("sessionStart", ">=", thirtyDaysAgo)
      .get();

    const sessionCount = sessionsSnapshot.size;

    return NextResponse.json({
      analyticsData,
      sessionCount,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}