import { endUserSession } from "@/app/_lib/analytics-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, timeSpent } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    await endUserSession(sessionId, timeSpent);
    return NextResponse.json(
      { success: true, message: "Session ended" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/analytics/session/end:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
