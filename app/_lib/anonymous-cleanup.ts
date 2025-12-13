import "server-only";
import { adminAuth, adminDb } from "./admin";

/**
 * Cleans up anonymous user accounts that are older than 1 hour.
 * This function:
 * 1. Queries all users marked as anonymous
 * 2. Checks if they were created more than 1 hour ago
 * 3. Deletes their Firebase Authentication account
 * 4. Deletes their Firestore user document
 * 5. Optionally deletes all their associated data (tasks, notes, etc.)
 */
export async function cleanupExpiredAnonymousAccounts(): Promise<{
  deletedCount: number;
  errors: string[];
}> {
  const results = {
    deletedCount: 0,
    errors: [] as string[],
  };

  try {
    console.log("Starting cleanup of expired anonymous accounts...");

    // anonymousCreatedAt is stored as a number (Date.now()), so compare with number
    const oneHourAgoTimestamp = Date.now() - 60 * 60 * 1000; // 1 hour in milliseconds

    const expiredUsersQuery = await adminDb
      .collection("users")
      .where("isAnonymous", "==", true)
      .where("anonymousCreatedAt", "<=", oneHourAgoTimestamp)
      .get();

    if (expiredUsersQuery.empty) {
      console.log("No expired anonymous accounts found");
      return results;
    }

    for (const userDoc of expiredUsersQuery.docs) {
      const userId = userDoc.id;
      //const userData = userDoc.data();

      try {
        console.log(`Deleting anonymous user: ${userId}`);

        // 1. Delete user's tasks
        const tasksQuery = await adminDb
          .collection("tasks")
          .where("userId", "==", userId)
          .get();

        const taskDeletions = tasksQuery.docs.map((taskDoc) =>
          taskDoc.ref.delete()
        );
        await Promise.all(taskDeletions);
        console.log(`Deleted ${tasksQuery.size} tasks for user ${userId}`);

        // 2. Delete user's notes (if any)
        const notesQuery = await adminDb
          .collection("notes")
          .where("userId", "==", userId)
          .get();

        const noteDeletions = notesQuery.docs.map((noteDoc) =>
          noteDoc.ref.delete()
        );
        await Promise.all(noteDeletions);
        console.log(`Deleted ${notesQuery.size} notes for user ${userId}`);

        // 3. Delete user's notifications (if any)
        const notificationsQuery = await adminDb
          .collection("notifications")
          .where("userId", "==", userId)
          .get();

        const notificationDeletions = notificationsQuery.docs.map(
          (notificationDoc) => notificationDoc.ref.delete()
        );
        await Promise.all(notificationDeletions);
        console.log(
          `Deleted ${notificationsQuery.size} notifications for user ${userId}`
        );

        // 4. Delete user's workout sessions (if any)
        const workoutQuery = await adminDb
          .collection("workoutSessions")
          .where("userId", "==", userId)
          .get();

        const workoutDeletions = workoutQuery.docs.map((workoutDoc) =>
          workoutDoc.ref.delete()
        );
        await Promise.all(workoutDeletions);
        console.log(
          `Deleted ${workoutQuery.size} workout sessions for user ${userId}`
        );

        // 5. Delete user's health data (if any)
        const healthQuery = await adminDb
          .collection("healthData")
          .where("userId", "==", userId)
          .get();

        const healthDeletions = healthQuery.docs.map((healthDoc) =>
          healthDoc.ref.delete()
        );
        await Promise.all(healthDeletions);
        console.log(
          `Deleted ${healthQuery.size} health records for user ${userId}`
        );

        // 6. Delete the user document from Firestore
        await userDoc.ref.delete();
        console.log(`Deleted user document for ${userId}`);

        // 7. Delete the user from Firebase Authentication
        await adminAuth.deleteUser(userId);
        console.log(`Deleted Firebase Auth user ${userId}`);

        results.deletedCount++;
        console.log(
          `Successfully deleted anonymous user ${userId} and all associated data`
        );
      } catch (userError) {
        const errorMessage = `Failed to delete user ${userId}: ${
          userError instanceof Error ? userError.message : String(userError)
        }`;
        console.error(errorMessage);
        results.errors.push(errorMessage);
      }
    }

    console.log(
      `Cleanup completed. Deleted ${results.deletedCount} anonymous accounts`
    );
    return results;
  } catch (error) {
    const errorMessage = `Failed to cleanup anonymous accounts: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(errorMessage);
    results.errors.push(errorMessage);
    return results;
  }
}
