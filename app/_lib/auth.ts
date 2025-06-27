import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import {
  NextAuthOptions,
  User as NextAuthUser,
  Session,
  Account,
} from "next-auth";
import { adminAuth, adminDb } from "@/app/_lib/admin";
import { Timestamp } from "firebase-admin/firestore";
import { Task } from "../_types/types";
import { isTaskAtRisk, MONDAY_START_OF_WEEK } from "../_utils/utils";
import { endOfWeek, isToday, startOfDay, startOfWeek } from "date-fns";

// Define a combined type for user objects that will hold rewardPoints
type UserWithExtendedData = (NextAuthUser | AdapterUser) & {
  rewardPoints: number;
  notifyReminders: boolean;
  notifyAchievements: boolean;
  achievements: { id: string; unlockedAt: Date }[];
};

interface FirebaseUser {
  uid: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  email_verified?: boolean;
}

interface FirestoreUserData {
  uid: string;
  provider: string;
  createdAt: Timestamp;
  rewardPoints: number;
  notifyReminders: boolean;
  notifyAchievements: boolean;
  achievements: { id: string; unlockedAt: Timestamp }[];
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface FirestoreUpdateData {
  lastLoginAt: Timestamp;
  displayName?: string | null;
  photoURL?: string | null;
}

type TaskUpdatePayload = {
  status?: "pending" | "completed" | "delayed";
  dueDate?: Date;
  risk?: boolean;
  "repetitionRule.completions"?: number;
  "repetitionRule.startDate"?: Date;
};

// Leave it here
/**
 ** interval tasks - reseted status and rule.completions
 ** daysOfWeek tasks - status, dueDate and rule.completions only reset when the new week comes
 ** timesPerWeek tasks - status, dueDate and rule.completions are reset only when the new week comes
 ** Next due date calculated only for weekly tasks when the new week came
 ** Needs admin access to the DB.
 * @param userId
 */
export async function updateUserRepeatingTasks(userId: string) {
  const today = startOfDay(new Date());

  const tasksRef = adminDb.collection("tasks");
  const snapshot = await tasksRef
    .where("userId", "==", userId)
    .where("isRepeating", "==", true)
    .get();

  if (snapshot.empty) {
    console.log("No repeating tasks found for user:", userId);
    return;
  }

  const batch = adminDb.batch();
  const updatesDetails = {
    count: 0,
    tasksTitles: [] as string[],
  };

  snapshot.docs.forEach((doc) => {
    const task = doc.data() as Task;
    const taskRef = doc.ref;
    const rule = task.repetitionRule;
    if (!rule) return;

    const updates: TaskUpdatePayload = {};
    const taskDueDate =
      task.dueDate instanceof Date
        ? task.dueDate
        : (task.dueDate as Timestamp).toDate();
    const ruleStartDate =
      rule.startDate instanceof Date
        ? rule.startDate
        : (rule.startDate as Timestamp).toDate();
    const taskCompletedAt = task.completedAt
      ? task.completedAt instanceof Date
        ? task.completedAt
        : (task.completedAt as Timestamp).toDate()
      : undefined;

    // Calc the next due date and reset the status and completions
    if (rule.interval && rule.interval > 0) {
      if (!isToday(taskCompletedAt as Date)) {
        updates.status = "pending";
        updates["repetitionRule.completions"] = 0;
      }
    } else if (rule.timesPerWeek) {
      const currentWeekStart = startOfWeek(today, MONDAY_START_OF_WEEK);
      const taskWeekStart = startOfWeek(ruleStartDate, MONDAY_START_OF_WEEK);

      if (currentWeekStart > taskWeekStart) {
        // We're in a new week period, reset the task
        updates.status = "pending";
        updates["repetitionRule.completions"] = 0;
        updates["repetitionRule.startDate"] = currentWeekStart;

        // Set due date to end of current week, but preserve the time
        const newDueDate = endOfWeek(today, MONDAY_START_OF_WEEK);
        newDueDate.setHours(taskDueDate.getHours(), taskDueDate.getMinutes());
        updates.dueDate = newDueDate;
      }
    } else if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
      const currentWeekStart = startOfWeek(today, MONDAY_START_OF_WEEK);
      const taskWeekStart = startOfWeek(taskDueDate, MONDAY_START_OF_WEEK);

      if (currentWeekStart > taskWeekStart) {
        updates.status = "pending";
        updates["repetitionRule.completions"] = 0;
      }
    }

    if (Object.keys(updates).length > 0) {
      // To calculate risk, we need a Task object with the updated values.
      const tempRule = {
        ...rule,
        completions: updates["repetitionRule.completions"] ?? rule.completions,
        startDate: updates["repetitionRule.startDate"] ?? rule.startDate,
      };
      const tempTask = {
        ...task,
        ...updates,
        repetitionRule: tempRule,
      };

      updates.risk = isTaskAtRisk(tempTask);
      batch.update(taskRef, updates);
      updatesDetails.count += 1;
      updatesDetails.tasksTitles.push(task.title);
    }
  });

  await batch.commit();
  console.log(
    `Repeating tasks (${
      updatesDetails.count
    } of them: ${updatesDetails.tasksTitles.join(
      ", "
    )}) done updating for user: ${userId}.`
  );
}

/**
 * NextAuth.js Configuration
 *
 * This configuration sets up authentication with multiple providers and implements
 * a comprehensive user management system with the following key features:
 *
 * 1. DUAL AUTHENTICATION PROVIDERS:
 *    - GitHub OAuth: Standard OAuth flow through NextAuth
 *    - Firebase Credentials: Custom flow where Firebase handles Google OAuth on client-side,
 *      then we verify the Firebase ID token server-side for security
 *
 * 2. JWT-BASED SESSIONS: Stateless authentication using JSON Web Tokens
 *
 * 3. DAILY TASK RESET SYSTEM:
 *    - Automatically updates repeating tasks on first login of each day
 *    - Updates lastLoginAt timestamp strategically to avoid excessive DB writes
 *    - Updates task statuses, due dates, and completion counters
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),

    // ----- Firebase Credentials Provider -----
    // Flow: Client → Firebase Auth (Google OAuth) → ID Token → Server verification
    // Firebase client SDK handles the OAuth dance with Google,
    // then we pass the Firebase ID token to this provider for server-side verification
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
      },

      /**
       * AUTHORIZE FUNCTION - Firebase Token Verification
       *
       * This function is called when a user signs in with Firebase credentials.
       * 1. Receives the Firebase ID token from the client
       * 2. Verifies the token using Firebase Admin SDK (security-critical step)
       * 3. Extracts user information from the verified token
       * 4. Creates or updates the user document in Firestore
       * 5. Handles daily task updates for returning users
       * 6. Returns a user object that NextAuth.js uses to build JWT and session
       *
       * The returned user object's 'id' property becomes token.sub and session.user.id
       */
      async authorize(credentials: Record<"idToken", string> | undefined) {
        // Ensure we receive the ID token from the client
        if (!credentials?.idToken) {
          console.error("No ID token provided to authorize for Firebase");
          return null;
        }

        try {
          // ----- FIREBASE TOKEN VERIFICATION -----
          // This is the most critical security step in the entire auth flow
          // adminAuth.verifyIdToken() ensures the token is:
          // - Genuine (signed by Firebase)
          // - Not expired
          // - Not tampered with
          // - Contains valid user claims
          const decodedToken = await adminAuth.verifyIdToken(
            credentials.idToken
          );

          // Ensure the decoded token contains required user identification
          if (!decodedToken || !decodedToken.uid) {
            console.error("Failed to verify Firebase ID token or UID missing");
            return null;
          }

          // ----- USER DATA EXTRACTION -----
          // Extract user information from the verified Firebase token
          // Firebase tokens contain standard OpenID Connect claims
          const firebaseUser: FirebaseUser = {
            uid: decodedToken.uid, // Firebase's unique user identifier
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split("@")[0],
            picture: decodedToken.picture, // Profile photo URL
            email_verified: decodedToken.email_verified, // Email verification status
          };

          // ----- FIRESTORE USER DOCUMENT MANAGEMENT -----
          // Every authenticated user gets a document in our Firestore 'users' collection
          // This document stores app-specific data like preferences and reward points
          const userDocRef = adminDb.collection("users").doc(firebaseUser.uid);
          const userDocSnap = await userDocRef.get();

          let rewardPoints = 0;
          let notifyReminders = true;
          let notifyAchievements = true;
          let lastLoginAt: Timestamp | undefined;

          if (!userDocSnap.exists) {
            // ----- NEW USER CREATION -----
            // First time this Firebase user is signing in to our app
            // Create a new user document with default settings

            // Build user data object, filtering out undefined values to prevent Firestore errors
            const newUserData: Partial<FirestoreUserData> = {
              uid: firebaseUser.uid,
              provider: "firebase",
              createdAt: Timestamp.now(),
              rewardPoints: 0,
              notifyReminders: true,
              notifyAchievements: true,
            };

            // Conditionally add optional fields only if they exist
            // This prevents Firestore from storing 'undefined' values
            if (firebaseUser.email !== undefined) {
              newUserData.email = firebaseUser.email;
            }
            if (firebaseUser.name !== undefined) {
              newUserData.displayName = firebaseUser.name;
            }
            if (firebaseUser.picture !== undefined) {
              newUserData.photoURL = firebaseUser.picture;
            }

            // Create the new user document in Firestore
            await userDocRef.set(newUserData);
          } else {
            // ----- EXISTING USER LOGIN HANDLING -----
            // User has signed in before - fetch their existing preferences and data
            const userData = userDocSnap.data();
            rewardPoints = userData?.rewardPoints || 0;
            notifyReminders = userData?.notifyReminders ?? true;
            notifyAchievements = userData?.notifyAchievements ?? true;
            lastLoginAt = userData?.lastLoginAt as Timestamp | undefined;

            // ----- DAILY TASK UPDATE SYSTEM -----
            if (
              !lastLoginAt ||
              lastLoginAt.toDate().toDateString() !== new Date().toDateString()
            ) {
              await updateUserRepeatingTasks(firebaseUser.uid);
            }

            // ----- USER PROFILE UPDATE -----
            // Update the user document with current login time and any profile changes
            const updateData: Partial<FirestoreUpdateData> = {
              lastLoginAt: Timestamp.now(),
            };

            // Update profile information if it has changed
            if (firebaseUser.name !== undefined) {
              updateData.displayName = firebaseUser.name;
            }
            if (firebaseUser.picture !== undefined) {
              updateData.photoURL = firebaseUser.picture;
            }

            await userDocRef.update(updateData);
          }

          // ----- RETURN USER OBJECT FOR NEXTAUTH -----
          // Create a user object in the format NextAuth.js expects
          // This object will be passed to the JWT and signIn callbacks
          // The 'id' field becomes the primary identifier in the JWT token
          const returnedUser = {
            id: firebaseUser.uid, // Firebase UID becomes NextAuth user ID
            name: firebaseUser.name,
            email: firebaseUser.email,
            image: firebaseUser.picture,
            rewardPoints: rewardPoints,
            notifyReminders: notifyReminders,
            notifyAchievements: notifyAchievements,
          };
          return returnedUser as NextAuthUser;
        } catch (error) {
          console.error("Firebase Auth Error in NextAuth authorize:", error);
          // Return null to prevent sign-in on any authentication failures
          return null;
        }
      },
    }),
  ],

  // ===== SESSION CONFIGURATION =====
  // Use JWT strategy for stateless authentication
  // JWTs are stored in HTTP-only cookies and contain user data
  // This eliminates the need for server-side session storage
  session: {
    strategy: "jwt",
  },

  // ===== NEXTAUTH CALLBACKS =====
  // These callbacks provide hooks into the authentication flow - customize behavior at key points
  callbacks: {
    /**
     * SIGNIN CALLBACK
     *
     * Called whenever a user signs in via OAuth providers (like GitHub)
     * Note: Firebase users are handled in the authorize function above
     *
     * This callback is responsible for:
     * 1. Creating/updating Firestore user documents for OAuth users
     * 2. Managing daily task updates for returning users
     * 3. Tracking login timestamps and user preferences
     * 4. Handling errors gracefully while allowing/preventing sign-in
     *
     * Return value determines if sign-in is allowed:
     * - true: Allow the sign-in to proceed
     * - false: Prevent sign-in (user sees error)
     */
    async signIn({ user, account }) {
      // Only process OAuth providers
      // Firebase users are handled in the authorize function above
      if (account && user.email) {
        // ----- FIRESTORE DOCUMENT REFERENCE -----
        // Use NextAuth user.id as document ID (this is the provider's user ID)
        const userDocRef = adminDb.collection("users").doc(user.id);
        const userDocSnap = await userDocRef.get();

        let rewardPoints = 0;
        let notifyReminders = true;
        let notifyAchievements = true;
        let lastLoginAt: Timestamp | undefined;

        if (!userDocSnap.exists) {
          // ----- NEW OAUTH USER CREATION -----
          try {
            // Build new user document with provider-specific information
            const newUserData: Partial<FirestoreUserData> = {
              uid: user.id, // Store NextAuth user.id (e.g., GitHub user ID)
              provider: account.provider, //  ('github', 'google', etc.)
              createdAt: Timestamp.now(),
              rewardPoints: 0,
              notifyReminders: true,
              notifyAchievements: true,
            };

            if (user.email !== undefined) {
              newUserData.email = user.email;
            }
            if (user.name !== undefined) {
              newUserData.displayName = user.name;
            }
            if (user.image !== undefined) {
              newUserData.photoURL = user.image;
            }

            // Create the user document in Firestore
            await userDocRef.set(newUserData);
            console.log(
              `New user document created in Firestore via NextAuth OAuth (${account.provider}):`,
              user.id
            );
          } catch (dbError) {
            console.error(
              "Firestore error during OAuth new user creation:",
              dbError
            );
            return false; // Prevent sign-in if DB operation fails
          }
        } else {
          // ----- EXISTING OAUTH USER LOGIN -----
          // User has signed in before - update their information and handle daily tasks

          const userData = userDocSnap.data();
          rewardPoints = userData?.rewardPoints || 0;
          notifyReminders = userData?.notifyReminders ?? true;
          notifyAchievements = userData?.notifyAchievements ?? true;
          lastLoginAt = userData?.lastLoginAt as Timestamp | undefined;

          // ----- DAILY TASK UPDATE TRIGGER -----
          if (
            !lastLoginAt ||
            lastLoginAt.toDate().toDateString() !== new Date().toDateString()
          ) {
            await updateUserRepeatingTasks(user.id);
          }

          try {
            // ----- USER PROFILE SYNCHRONIZATION -----
            // Update user document with current login and any profile changes
            const updateData: Partial<FirestoreUpdateData> = {
              lastLoginAt: Timestamp.now(), // Track last access time
            };

            // Sync profile data from OAuth provider
            if (user.name !== undefined) {
              updateData.displayName = user.name;
            }
            if (user.image !== undefined) {
              updateData.photoURL = user.image;
            }

            await userDocRef.update(updateData);
          } catch (dbError) {
            // ----- UPDATE ERROR HANDLING -----
            // Don't prevent sign-in for update failures, but log them
            // User can still access the app even if profile sync fails
            console.error("Firestore error during OAuth user update:", dbError);
          }
        }

        // ----- EXTEND USER OBJECT FOR JWT CALLBACK -----
        // Attach custom user data to the user object so it's available in the JWT callback
        // This is how we pass Firestore data into the NextAuth token system
        const extendedUser = user as UserWithExtendedData;
        extendedUser.rewardPoints = rewardPoints;
        extendedUser.notifyReminders = notifyReminders;
        extendedUser.notifyAchievements = notifyAchievements;
      }
      return true; // Allow sign-in to proceed
    },

    /**
     * JWT CALLBACK
     *
     * This is the most important callback in our authentication system.
     * It's called whenever a JWT is created (initial sign-in) or accessed (subsequent requests).
     *
     * Key responsibilities:
     * 1. INITIAL SIGN-IN: Populate JWT with user data from authorize/signIn callbacks
     * 2. SUBSEQUENT REQUESTS: Refresh JWT data from Firestore to keep it current
     * 3. DAILY MAINTENANCE: Trigger daily task updates via intelligent login tracking
     * 4. DATA SYNCHRONIZATION: Ensure JWT contains up-to-date user preferences
     *
     * The JWT token is what gets stored in the browser and contains user session data.
     * This callback shapes what data is available throughout the application.
     */
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: NextAuthUser | AdapterUser;
      account?: Account | null;
    }) {
      // ----- INITIAL SIGN-IN HANDLING -----
      // When both 'account' and 'user' are present, this is a fresh sign-in
      // We need to populate the JWT token with user data for the first time
      if (account && user) {
        // Transfer core user data from the authorize/signIn callbacks to JWT
        token.uid = user.id; // Primary user identifier (Firebase UID or OAuth provider ID)
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.provider = account.provider;

        // ----- CUSTOM USER DATA INTEGRATION -----
        // Extract our app-specific data that was added in authorize/signIn callbacks
        const userExtended = user as UserWithExtendedData;
        if (typeof userExtended.rewardPoints === "number") {
          token.rewardPoints = userExtended.rewardPoints;
        } else {
          token.rewardPoints = 0; // Safe default if data is missing
        }
        token.notifyReminders = userExtended.notifyReminders ?? true;
        token.notifyAchievements = userExtended.notifyAchievements ?? true;
      } else if (token.uid) {
        // ----- SUBSEQUENT JWT ACCESS (REFRESH) -----
        // This runs on every protected request to ensure JWT data stays fresh
        // We fetch the latest user data from Firestore and update the token
        try {
          const userDocRef = adminDb.collection("users").doc(token.uid);
          const userDocSnap = await userDocRef.get();

          if (userDocSnap.exists) {
            const userData = userDocSnap.data();

            // ----- REFRESH TOKEN DATA -----
            // Update JWT with the latest data from Firestore
            // This ensures changes made in other parts of the app are reflected
            token.rewardPoints = userData?.rewardPoints || 0;
            token.notifyReminders = userData?.notifyReminders ?? true;
            token.notifyAchievements = userData?.notifyAchievements ?? true;

            const lastLoginAt = userData?.lastLoginAt as Timestamp | undefined;

            // ----- INTELLIGENT LOGIN TRACKING -----
            // We don't want to update lastLoginAt on every single request (too expensive)
            // Instead, we use smart logic to update only when meaningful:
            // 1. It's a new day (triggers daily task updates)
            // 2. No previous login recorded (new user)
            // 3. More than 5 minutes since last update (prevents spam)
            const now = new Date();
            const shouldUpdateLastLogin =
              !lastLoginAt ||
              lastLoginAt.toDate().toDateString() !== now.toDateString() ||
              now.getTime() - lastLoginAt.toDate().getTime() > 60 * 5 * 1000;

            if (shouldUpdateLastLogin) {
              // ----- UPDATE LAST LOGIN TIMESTAMP -----
              // Record when the user was last active in the application
              await userDocRef.update({
                lastLoginAt: Timestamp.now(),
              });

              // ----- DAILY TASK MAINTENANCE TRIGGER -----
              if (
                !lastLoginAt ||
                lastLoginAt.toDate().toDateString() !== now.toDateString()
              ) {
                await updateUserRepeatingTasks(token.uid);
                console.log(
                  `Updated lastLoginAt and ran daily tasks update for user ${token.uid} via JWT callback`
                );
              } else {
                console.log(
                  `Updated lastLoginAt for user ${token.uid} via JWT callback`
                );
              }
            }
          }
        } catch (error) {
          // ----- ERROR HANDLING -----
          // Log errors but don't break the authentication flow
          // Users can still use the app even if this refresh fails
          console.error(
            "Error fetching/updating user data in JWT callback:",
            error
          );
        }
      }

      // Always return the token (potentially modified) for NextAuth to use
      return token;
    },

    /**
     * SESSION CALLBACK
     *
     * Called whenever a session is checked via getSession(), useSession(), getServerSession(), etc.
     * This callback transforms the JWT token into the session object that's available to the client.
     *
     * The session object returned here is what developers access throughout the application:
     * - In CC via useSession()
     * - In SC and route handlers via getServerSession()
     *
     * Key responsibilities:
     * 1. Transfer data from JWT token to session.user object
     * 2. Ensure all required fields are present with safe defaults
     * 3. Shape the final user interface available to the application
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // ----- TRANSFER CORE USER DATA -----
        // Move standard user information from JWT to session
        if (token.uid) session.user.id = token.uid;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
        if (token.provider) session.user.provider = token.provider;

        // ----- ENSURE CUSTOM PROPERTIES WITH SAFE DEFAULTS -----
        session.user.rewardPoints = token.rewardPoints ?? 0;
        session.user.notifyReminders = token.notifyReminders ?? true;
        session.user.notifyAchievements = token.notifyAchievements ?? true;
      }

      // Return the complete session object for use throughout the application
      return session;
    },
  },

  // ===== CUSTOM PAGES CONFIGURATION =====
  pages: {
    // Redirect unauthenticated users accessing protected routes/content to our custom login page
    signIn: "/login",
  },
};
