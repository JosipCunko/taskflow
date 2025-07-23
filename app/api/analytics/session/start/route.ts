import { startUserSession } from "@/app/_lib/analytics-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, pageTitle } = await req.json();
    if (!userId || !pageTitle) {
      return new NextResponse("Missing userId or pageTitle", { status: 400 });
    }

    const sessionId = await startUserSession(userId, pageTitle);
    if (sessionId) {
      return NextResponse.json({ sessionId });
    } else {
      return new NextResponse("Failed to start session", { status: 500 });
    }
  } catch (error) {
    console.error("Error in /api/analytics/session/start:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
