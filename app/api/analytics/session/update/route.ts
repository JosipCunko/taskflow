import { updateUserSession } from "@/app/_lib/analytics-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, pageTitle, timeSpent } = await req.json();
    if (!sessionId || !pageTitle || timeSpent === undefined) {
      return new NextResponse("Missing sessionId, pageTitle, or timeSpent", {
        status: 400,
      });
    }

    await updateUserSession(sessionId, pageTitle, timeSpent);
    return new NextResponse("Session updated", { status: 200 });
  } catch (error) {
    console.error("Error in /api/analytics/session/update:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
