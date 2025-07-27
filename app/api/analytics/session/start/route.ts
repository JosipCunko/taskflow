import { startUserSession } from "@/app/_lib/analytics-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, pageTitle } = await req.json();
    if (!userId || !pageTitle) {
      return NextResponse.json(
        { error: "Missing userId or pageTitle" },
        { status: 400 }
      );
    }

    const sessionId = await startUserSession(userId, pageTitle);
    if (sessionId) {
      return NextResponse.json({ sessionId });
    } else {
      return NextResponse.json(
        { error: "Failed to start session" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in /api/analytics/session/start:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
