import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { adminDb } from "@/app/_lib/admin";
import { createTask } from "@/app/_lib/tasks-admin";
import { YouTubeVideo, TaskToCreateData, Notification } from "@/app/_types/types";
import { Timestamp } from "firebase-admin/firestore";
import { endOfWeek } from "date-fns";

async function createNotification(userId: string, summary: string, videoCount: number): Promise<string> {
  const notification: Omit<Notification, "id"> = {
    userId,
    type: "YOUTUBE_SUMMARY",
    priority: "MEDIUM",
    title: `📺 YouTube Summary - ${videoCount} New Videos`,
    message: summary.slice(0, 200) + (summary.length > 200 ? "..." : ""),
    actionText: "View Summary",
    actionUrl: "/webapp/inbox",
    isRead: false,
    isArchived: false,
    createdAt: new Date(),
    data: {
      fullSummary: summary,
      videoCount
    }
  };

  const docRef = await adminDb.collection("notifications").add({
    ...notification,
    createdAt: Timestamp.fromDate(notification.createdAt)
  });

  return docRef.id;
}

async function createWatchVideoTasks(userId: string, videos: YouTubeVideo[]): Promise<string[]> {
  const taskIds: string[] = [];
  const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start

  // Create tasks for the most interesting videos (top 3-5)
  const topVideos = videos.slice(0, Math.min(5, videos.length));

  for (const video of topVideos) {
    try {
      const taskData: TaskToCreateData = {
        userId,
        title: `Watch: ${video.title}`,
        description: `${video.channelTitle}\n\n${video.description.slice(0, 300)}${video.description.length > 300 ? "..." : ""}`,
        icon: "Play",
        color: "#ef4444", // Red color for video tasks
        isPriority: false,
        isReminder: true,
        dueDate: endOfCurrentWeek,
        tags: ["youtube", "video", video.channelTitle.toLowerCase().replace(/\s+/g, "-")],
        duration: {
          hours: 0,
          minutes: 15 // Default 15 minutes for video watching
        },
        location: `https://www.youtube.com/watch?v=${video.id}`,
        isRepeating: false
      };

      const task = await createTask(taskData);
      if (task) {
        taskIds.push(task.id);
      }
    } catch (error) {
      console.error(`Error creating task for video ${video.id}:`, error);
    }
  }

  return taskIds;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { summaryId } = body;

    if (!summaryId) {
      return NextResponse.json({ error: "Summary ID is required" }, { status: 400 });
    }

    // Get the YouTube summary
    const summaryDoc = await adminDb.collection("youtubeSummaries").doc(summaryId).get();
    
    if (!summaryDoc.exists) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    const summaryData = summaryDoc.data();
    if (summaryData?.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to summary" }, { status: 403 });
    }

    const videos: YouTubeVideo[] = summaryData.videos.map((video: YouTubeVideo & { publishedAt: { toDate: () => Date } }) => ({
      ...video,
      publishedAt: video.publishedAt.toDate()
    }));

    // Create notification
    const notificationId = await createNotification(
      userId, 
      summaryData.summary, 
      videos.length
    );

    // Create watch video tasks
    const taskIds = await createWatchVideoTasks(userId, videos);

    // Update summary with created notification and task IDs
    await adminDb.collection("youtubeSummaries").doc(summaryId).update({
      notificationId,
      taskIds,
      processedAt: Timestamp.fromDate(new Date())
    });

    return NextResponse.json({
      success: true,
      notificationId,
      taskIds,
      message: `Created 1 notification and ${taskIds.length} video watching tasks`
    });

  } catch (error) {
    console.error("Error creating YouTube tasks and notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}