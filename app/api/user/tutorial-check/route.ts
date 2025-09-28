import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { adminDb } from "@/app/_lib/admin";
import { startOfDay, differenceInHours } from "date-fns";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();
    
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user document from Firestore
    const userDocRef = adminDb.collection("users").doc(userId);
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDocSnap.data();
    const lastLoginAt = userData?.lastLoginAt as Timestamp | undefined;
    const now = new Date();
    const today = startOfDay(now);

    let isFirstLoginToday = false;

    if (lastLoginAt) {
      const lastLoginDate = lastLoginAt.toDate();
      const lastLoginDay = startOfDay(lastLoginDate);
      
      // If last login was yesterday or earlier, this is first login today
      if (lastLoginDay < today) {
        isFirstLoginToday = true;
      }
      
      // Also check if it's been more than 12 hours since last login
      // This helps catch cases where someone logs in late at night and early morning
      const hoursSinceLastLogin = differenceInHours(now, lastLoginDate);
      if (hoursSinceLastLogin >= 12) {
        isFirstLoginToday = true;
      }
    } else {
      // No last login recorded, this is definitely first login today
      isFirstLoginToday = true;
    }

    return NextResponse.json({ 
      isFirstLoginToday,
      lastLoginAt: lastLoginAt?.toDate().toISOString() || null 
    });

  } catch (error) {
    console.error("Error checking tutorial status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}