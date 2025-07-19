import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { adminDb } from "@/app/_lib/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "exists" : "missing");

    if (!session?.user?.id) {
      console.log("Unauthorized: No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the FCM token from request body
    const { token } = await request.json();
    console.log("Received token:", token ? "exists" : "missing");

    if (!token || typeof token !== "string") {
      console.log("Invalid token:", token);
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    console.log("Saving FCM token for user:", session.user.id);

    // Save the FCM token to the user's document using Admin SDK
    const userDocRef = adminDb.collection("users").doc(session.user.id);
    await userDocRef.set(
      {
        fcmToken: token,
        fcmTokenUpdatedAt: FieldValue.serverTimestamp(),
        notificationsEnabled: true,
      },
      { merge: true } // Don't overwrite other user data
    );

    console.log("FCM token saved successfully");

    return NextResponse.json({
      success: true,
      message: "FCM token saved successfully",
    });
  } catch (error) {
    console.error("Detailed error in save-token route:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    return NextResponse.json(
      {
        error: "Failed to save FCM token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
