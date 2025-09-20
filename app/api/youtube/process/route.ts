import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has enabled YouTube summarizer
    // This could be a user preference in the future
    
    // Step 1: Generate YouTube summary
    const summarizeResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/youtube/summarize`, {
      method: "POST",
      headers: {
        "Cookie": request.headers.get("cookie") || "",
        "Content-Type": "application/json"
      }
    });

    if (!summarizeResponse.ok) {
      const error = await summarizeResponse.json();
      return NextResponse.json(error, { status: summarizeResponse.status });
    }

    const summaryResult = await summarizeResponse.json();

    if (!summaryResult.success) {
      return NextResponse.json(summaryResult);
    }

    // Step 2: Create tasks and notifications
    const createTasksResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/youtube/create-tasks`, {
      method: "POST",
      headers: {
        "Cookie": request.headers.get("cookie") || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summaryId: summaryResult.summaryId
      })
    });

    if (!createTasksResponse.ok) {
      const error = await createTasksResponse.json();
      return NextResponse.json(error, { status: createTasksResponse.status });
    }

    const tasksResult = await createTasksResponse.json();

    return NextResponse.json({
      success: true,
      summary: summaryResult.summary,
      videoCount: summaryResult.videoCount,
      notificationId: tasksResult.notificationId,
      taskIds: tasksResult.taskIds,
      message: `YouTube summary generated with ${summaryResult.videoCount} videos. Created ${tasksResult.taskIds.length} tasks and 1 notification.`
    });

  } catch (error) {
    console.error("Error in YouTube process route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}