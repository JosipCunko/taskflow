import { endUserSession } from "@/app/_lib/analytics-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return new NextResponse("Missing sessionId", { status: 400 });
    }

    await endUserSession(sessionId);
    return new NextResponse("Session ended", { status: 200 });
  } catch (error) {
    console.error("Error in /api/analytics/session/end:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
