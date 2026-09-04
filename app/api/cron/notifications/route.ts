import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/app/_lib/admin";
import { getTasksByUserId } from "@/app/_lib/tasks-admin";
import {
  generateNotificationsForUser,
  cleanupExpiredNotifications,
} from "@/app/_lib/notifications-admin";

/**
 * Background job that checks every user's tasks and generates/pushes
 * reminder notifications (overdue, due-soon, time-window).
 *
 * This is NOT triggered by Vercel Cron because on the Vercel Hobby plan
 * cron jobs can only run once per day, which is useless for "task starts
 * in 15 minutes"-style reminders. Instead, this route is meant to be
 * pinged every 5-15 minutes by an external scheduler (e.g. a Render Cron
 * Job, cron-job.org, or a GitHub Actions scheduled workflow) using the
 * same Bearer-token pattern as /api/admin/cleanup-anonymous.
 *
 * Required env var: CRON_SECRET
 */
export async function GET(request: NextRequest) {
  return handleNotificationSweep(request);
}

// Some schedulers (Render Cron Jobs in particular) are easiest to wire up
// with a POST request, so support both.
export async function POST(request: NextRequest) {
  return handleNotificationSweep(request);
}

async function handleNotificationSweep(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET is not configured on the server");
      return NextResponse.json(
        { error: "Server misconfigured - missing CRON_SECRET" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("Unauthorized notification sweep attempt - invalid secret");
      return NextResponse.json(
        { error: "Unauthorized - Invalid or missing CRON_SECRET" },
        { status: 401 }
      );
    }

    console.log("Starting scheduled notification sweep...");

    // Only bother with users who actually opted into reminders AND have a
    // push token saved - no point running the task math otherwise.
    const usersSnapshot = await adminDb
      .collection("users")
      .where("notifyReminders", "==", true)
      .get();

    let usersChecked = 0;
    let usersWithErrors = 0;
    const errors: string[] = [];

    await Promise.all(
      usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        try {
          const tasks = await getTasksByUserId(userId);
          await generateNotificationsForUser(userId, tasks);
          await cleanupExpiredNotifications(userId);
          usersChecked++;
        } catch (error) {
          usersWithErrors++;
          const message = `Failed to process notifications for user ${userId}: ${
            error instanceof Error ? error.message : String(error)
          }`;
          console.error(message);
          errors.push(message);
        }
      })
    );

    console.log(
      `Notification sweep completed. Checked ${usersChecked} users, ${usersWithErrors} errors.`
    );

    return NextResponse.json({
      success: true,
      usersChecked,
      usersWithErrors,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in notification sweep:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
