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
import { AppUser, Task } from "../_types/types";
import { isTaskAtRisk, safeConvertToTimestamp } from "../_utils/utils";
import { startOfDay, differenceInCalendarDays } from "date-fns";
import { checkAndAwardAchievements } from "./achievements";
import { getTasksByUserId } from "./tasks-admin";
import { generateNotificationsForUser } from "./notifications-admin";
import { scheduleTaskRevalidation } from "../_utils/serverCache";
import { getRepeatingTaskDailyUpdates } from "./repeatingTasks";

interface FirebaseUser {
  uid: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  email_verified?: boolean;
}

type TaskUpdatePayload = {
  completedAt?: number;
  status?: "pending" | "completed" | "delayed";
  dueDate?: number;
  startDate?: number;
  risk?: boolean;
  "repetitionRule.completions"?: number;
  "repetitionRule.completedAt"?: number[];
  points?: number;
};

/**
 * Progress for weekly tasks is derived from repetitionRule.completedAt so a
 * timezone-skewed startDate cannot wipe in-progress completions.
 *  interval tasks - reseted status and rule.completions
 ** daysOfWeek tasks - status, dueDate and rule.completions only reset when the new week comes
 ** timesPerWeek tasks - status, dueDate and rule.completions are reset only when the new week comes
 ** Next due date calculated only for weekly tasks when the new week came
 ** updatedAt property is NOT updated
 ** Needs admin access to the DB.
 */
export async function updateUserRepeatingTasks(userId: string) {
  const today = new Date();

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
    const data = doc.data();
    const task = {
      ...(data as Task),
      id: doc.id,
      dueDate: safeConvertToTimestamp(data.dueDate),
      createdAt: safeConvertToTimestamp(data.createdAt),
      startDate: data.startDate
        ? safeConvertToTimestamp(data.startDate)
        : undefined,
      completedAt: data.completedAt
        ? safeConvertToTimestamp(data.completedAt)
        : undefined,
      repetitionRule: data.repetitionRule
        ? {
            ...data.repetitionRule,
            completedAt: Array.isArray(data.repetitionRule.completedAt)
              ? data.repetitionRule.completedAt.map(
                  (date: Parameters<typeof safeConvertToTimestamp>[0]) =>
                    safeConvertToTimestamp(date),
                )
              : [],
            completions: data.repetitionRule.completions ?? 0,
          }
        : undefined,
    } as Task;

    const taskRef = doc.ref;
    if (!task.repetitionRule) return;

    const updates: TaskUpdatePayload = {
      ...getRepeatingTaskDailyUpdates(task, today),
    };

    if (Object.keys(updates).length > 0) {
      const mergedRule = {
        ...task.repetitionRule,
        completions:
          updates["repetitionRule.completions"] ??
          task.repetitionRule.completions,
      };
      const tempTask: Task = {
        ...task,
        status: updates.status ?? task.status,
        dueDate: updates.dueDate ?? task.dueDate,
        startDate: updates.startDate ?? task.startDate,
        points: updates.points ?? task.points,
        repetitionRule: mergedRule,
      };
      const newRisk = isTaskAtRisk(tempTask);
      if (newRisk !== task.risk) {
        updates.risk = newRisk;
      }
    }

    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );

    if (Object.keys(safeUpdates).length > 0) {
      batch.update(taskRef, safeUpdates);
      updatesDetails.count += 1;
      updatesDetails.tasksTitles.push(task.title);
    }
  });

  // Only commit if there are actual updates
  if (updatesDetails.count > 0) {
    await batch.commit();
    console.log(
      `Repeating tasks (${
        updatesDetails.count
      } of them: ${updatesDetails.tasksTitles.join(
        ", ",
      )}) done updating for user: ${userId}.`,
    );

    // Cannot revalidateTag during render (JWT callback). Schedule it after
    // the response so later navigations and other devices see fresh data.
    scheduleTaskRevalidation(userId, { includeUser: true });
  } else {
    console.log(`No repeating task updates needed for user: ${userId}.`);
  }
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
            credentials.idToken,
          );

          // Ensure the decoded token contains required user identification
          if (!decodedToken || !decodedToken.uid) {
            console.error("Failed to verify Firebase ID token or UID missing");
            return null;
          }

          // ----- USER DATA EXTRACTION -----
          // Extract user information from the verified Firebase token
          // Firebase tokens contain standard OpenID Connect claims
          // For anonymous users: email, name, picture will be undefined/null
          const isAnonymous = !decodedToken.email && !decodedToken.name;
          const firebaseUser: FirebaseUser = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name:
              decodedToken.name ||
              decodedToken.email?.split("@")[0] ||
              (isAnonymous ? `Guest-${decodedToken.uid.slice(-8)}` : undefined),
            picture: decodedToken.picture,
            email_verified: decodedToken.email_verified,
          };

          // ----- FIRESTORE USER DOCUMENT MANAGEMENT -----
          const userDocRef = adminDb.collection("users").doc(firebaseUser.uid);
          const userDocSnap = await userDocRef.get();
          let lastLoginAt: number | undefined;
          let createdAt: number | undefined;

          if (!userDocSnap.exists) {
            // ----- NEW USER CREATION -----
            // First time this Firebase user is signing in to our app
            // Create a new user document with default settings

            // Build user data object, filtering out undefined values to prevent Firestore errors
            const newUserData: Partial<AppUser> = {
              uid: firebaseUser.uid,
              provider: "firebase",
              createdAt: Date.now(),
              notifyReminders: true,
              notifyAchievements: true,
              rewardPoints: 0,
              completedTasksCount: 0,
              currentStreak: 0,
              bestStreak: 0,
              achievements: [],
              lastLoginAt: Date.now(),

              currentPlan: "base",
              aiPromptsToday: 0,
              // Mark anonymous users for potential cleanup
              ...(isAnonymous && {
                isAnonymous: true,
                anonymousCreatedAt: Date.now(),
              }),
              ...(firebaseUser.email && { email: firebaseUser.email }),
              ...(firebaseUser.name && { displayName: firebaseUser.name }),
              ...(firebaseUser.picture && { photoURL: firebaseUser.picture }),
            };

            await userDocRef.set(newUserData);
            console.log(
              `New user document created in Firestore via Firebase Credentials:`,
              firebaseUser.uid,
            );
          } else {
            // ----- EXISTING USER LOGIN HANDLING -----
            // User has signed in before - fetch their existing preferences and data
            const userData = userDocSnap.data();
            lastLoginAt = userData?.lastLoginAt;
            createdAt = userData?.createdAt;
          }

          // Removed updateUserRepeatingTasks and userDocRef.update({ lastLoginAt: new Date() })
          // because it's handled in the jwt callback

          // ----- RETURN USER OBJECT FOR NEXTAUTH -----
          // Create a user object in the format NextAuth.js expects
          // This object will be passed to the JWT and signIn callbacks
          // The 'id' field becomes the primary identifier in the JWT token
          const returnedUser = {
            id: firebaseUser.uid, // Firebase UID becomes NextAuth user ID
            name: firebaseUser.name,
            email: firebaseUser.email,
            image: firebaseUser.picture,
            lastLoginAt: lastLoginAt || Date.now(),
            createdAt: createdAt || Date.now(),
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
      if (account && user.email) {
        // ----- FIRESTORE DOCUMENT REFERENCE -----
        // Use NextAuth user.id as document ID (this is the provider's user ID)
        const userDocRef = adminDb.collection("users").doc(user.id);
        const userDocSnap = await userDocRef.get();

        if (!userDocSnap.exists) {
          // ----- NEW OAUTH USER CREATION -----
          try {
            // Build new user document with provider-specific information
            // Made type partial because User from next-auth has optional fields like name, email, image
            const newUserData: Partial<AppUser> = {
              uid: user.id, // Store NextAuth user.id (e.g., GitHub user ID)
              provider: account.provider, //  ('github', 'google', etc.)
              createdAt: Date.now(),
              rewardPoints: 0,
              notifyReminders: true,
              notifyAchievements: true,
              completedTasksCount: 0,
              currentStreak: 0,
              bestStreak: 0,
              achievements: [],
              lastLoginAt: Date.now(),

              currentPlan: "base",
              aiPromptsToday: 0,
              ...(user.email && { email: user.email }),
              ...(user.name && { displayName: user.name }),
              ...(user.image && { photoURL: user.image }),
            };

            await userDocRef.set(newUserData);
            console.log(
              `New user document created in Firestore via NextAuth OAuth (${account.provider}):`,
              user.id,
            );
          } catch (dbError) {
            console.error(
              "Firestore error during OAuth new user creation:",
              dbError,
            );
            return false; // Prevent sign-in if DB operation fails
          }
        } else {
          // ----- EXISTING OAUTH USER LOGIN -----
          // User has signed in before - we can update their information
          // Removed updateUserRepeatingTasks and userDocRef.update({ lastLoginAt: new Date() })
          // because it's handled in the jwt callback
        }

        // ----- EXTEND USER OBJECT FOR JWT CALLBACK -----
        // Attach custom user data to the user object so it's available in the JWT callback
        // This is how we pass Firestore data into the NextAuth token system
        /*const extendedUser = user as UserWithExtendedData;
        extendedUser.rewardPoints = rewardPoints;*/
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
      // ----- 1. INITIAL SIGN-IN -----
      // On initial sign-in, persist essential user data to the token.
      // The 'user' object comes from the 'authorize' or 'signIn' callbacks.
      if (account && user) {
        token.uid = user.id;
        token.provider = account.provider;
        token.createdAt = user.createdAt;
        // name, email, and picture are automatically handled by NextAuth
      }

      // ----- 2. DAILY MAINTENANCE ON SUBSEQUENT REQUESTS -----
      // For users with an active session, this block runs to check if daily
      // maintenance tasks (like updating repeating tasks) are needed.
      if (token.uid) {
        try {
          const userDocRef = adminDb.collection("users").doc(token.uid);
          const userDocSnap = await userDocRef.get();

          if (userDocSnap.exists) {
            const userData = userDocSnap.data() as AppUser; // Careful
            const lastLoginAt = userData?.lastLoginAt as number | undefined;
            const now = new Date();
            const today = startOfDay(now);

            // Check if more than 5 minutes have passed since the last recorded activity.
            if (!lastLoginAt || now.getTime() - lastLoginAt > 5 * 60 * 1000) {
              const updates: {
                lastLoginAt: number;
                currentStreak?: number;
                bestStreak?: number;
                aiPromptsToday?: number;
                lastPromptDate?: number;
              } = {
                lastLoginAt: Date.now(),
              };

              // Calculate streak based on consecutive login days
              if (lastLoginAt) {
                const lastLoginDate = startOfDay(new Date(lastLoginAt));
                const diff = differenceInCalendarDays(today, lastLoginDate);

                if (diff === 1) {
                  // Consecutive day - increment streak
                  const newStreak = (userData.currentStreak || 0) + 1;
                  updates.currentStreak = newStreak;
                  updates.bestStreak = Math.max(
                    newStreak,
                    userData.bestStreak || 0,
                  );
                } else if (diff > 1) {
                  // Gap in login days - restart streak at 1 for today
                  updates.currentStreak = 1;
                  updates.bestStreak = Math.max(1, userData.bestStreak || 0);
                }
                // If diff === 0, it's the same day - no streak changes needed
              } else {
                // First time user - start streak at 1
                updates.currentStreak = 1;
                updates.bestStreak = 1;
              }

              const userLastPromptDate = userData.lastPromptDate
                ? startOfDay(userData.lastPromptDate)
                : undefined;

              if (!userLastPromptDate || userLastPromptDate < today) {
                // New day - reset AI prompt count
                updates.aiPromptsToday = 0;
              }

              // Write repeating-task resets BEFORE reading tasks so notifications
              // and the page that triggered this JWT refresh see Firestore, not
              // pre-reset data.
              await Promise.all([
                userDocRef.update(updates),
                updateUserRepeatingTasks(token.uid),
              ]);
              const tasks = await getTasksByUserId(token.uid);
              await Promise.all([
                checkAndAwardAchievements(token.uid),
                generateNotificationsForUser(token.uid, tasks),
              ]);
            }
          }
        } catch (error) {
          console.error(
            "Error during periodic maintenance in JWT callback:",
            error,
          );
        }
      }

      // ----- 3. RETURN THE LEAN TOKEN -----
      // The token returned here is lean and does not contain the full user profile.
      // This keeps it small and performant.
      return token;
    },

    /**
     * SESSION CALLBACK
     *
     * Called whenever a session is checked via getSession(), useSession(), getServerSession(), etc.
     * This callback transforms the JWT token into the session object that's available to the client.
     *
     * It's responsible for transferring the lean data from our JWT to the final
     * session object that the application will use.
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      // Transfer essential data from the lean token to the session object
      if (session.user) {
        if (token.uid) session.user.id = token.uid;
        if (token.provider) session.user.provider = token.provider;
        if (token.createdAt) session.user.createdAt = token.createdAt;
        // name, email, and image are already handled by NextAuth and are on the default session user
      }
      return session;
    },
  },

  // ===== CUSTOM PAGES CONFIGURATION =====
  pages: {
    // Redirect unauthenticated users accessing protected routes/content to our custom login page
    signIn: "/login",
  },
};
