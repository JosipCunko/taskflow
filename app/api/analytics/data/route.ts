import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { getAnalyticsData } from "@/app/_lib/analytics-admin";
import { adminDb } from "@/app/_lib/admin";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analyticsData = await getAnalyticsData(session.user.id);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const sessionsSnapshot = await adminDb
      .collection("userSessions")
      .where("userId", "==", session.user.id)
      .where("sessionStart", ">=", thirtyDaysAgo)
      .get();

    const sessionsCount = sessionsSnapshot.size;

    return NextResponse.json({
      analyticsData,
      sessionsCount,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
