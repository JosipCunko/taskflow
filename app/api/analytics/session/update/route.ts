import { updateUserSession } from "@/app/_lib/analytics-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId, pageTitle, timeSpent } = await req.json();
    if (!sessionId || !pageTitle || timeSpent === undefined) {
      return NextResponse.json(
        { error: "Missing sessionId, pageTitle, or timeSpent" },
        {
          status: 400,
        }
      );
    }

    await updateUserSession(sessionId, pageTitle, timeSpent);
    return NextResponse.json(
      { success: true, message: "Session updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/analytics/session/update:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
