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
import { AppUser, DayOfWeek, Task } from "../_types/types";
import { isTaskAtRisk, MONDAY_START_OF_WEEK } from "../_utils/utils";
import {
  addDays,
  getDay,
  isPast,
  isSameWeek,
  isToday,
  startOfDay,
  startOfWeek,
  differenceInCalendarDays,
  startOfMonth,
  isSameMonth,
  getDaysInMonth,
} from "date-fns";
import { checkAndAwardAchievements } from "./achievements";

interface FirebaseUser {
  uid: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  email_verified?: boolean;
}

type TaskUpdatePayload = {
  status?: "pending" | "completed" | "delayed";
  dueDate?: Date;
  startDate?: Date;
  risk?: boolean;
  "repetitionRule.completions"?: number;
  "repetitionRule.completedAt"?: Date[];
  points?: number;
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
    const taskStartDate = task.startDate
      ? task.startDate instanceof Date
        ? task.startDate
        : (task.startDate as Timestamp).toDate()
      : new Date();
    const taskCompletedAt = task.completedAt
      ? task.completedAt instanceof Date
        ? task.completedAt
        : (task.completedAt as Timestamp).toDate()
      : undefined;
    const currentWeekStart = startOfWeek(today, MONDAY_START_OF_WEEK);

    // Helper function to safely update field only if value has changed
    const setIfChanged = (
      key: keyof TaskUpdatePayload,
      newValue: unknown,
      currentValue: unknown
    ) => {
      if (newValue !== currentValue && newValue !== undefined) {
        (updates as Record<string, unknown>)[key] = newValue;
      }
    };

    // Helper function to safely update nested field only if value has changed
    const setNestedIfChanged = (
      key: string,
      newValue: unknown,
      currentValue: unknown
    ) => {
      if (newValue !== currentValue && newValue !== undefined) {
        (updates as Record<string, unknown>)[key] = newValue;
      }
    };

    // Calculate points deductions for missed days only if not already calculated
    const calculateMissedDaysPenalty = (
      daysToCheck: Date[],
      currentPoints: number
    ): number => {
      let missedDays = 0;
      daysToCheck.forEach((dayToCheck) => {
        if (isPast(dayToCheck) && !isToday(dayToCheck)) {
          if (
            !rule.completedAt?.some((completedDate) => {
              const completedDay =
                completedDate instanceof Date
                  ? completedDate
                  : (completedDate as Timestamp).toDate();
              return (
                startOfDay(completedDay).getTime() ===
                startOfDay(dayToCheck).getTime()
              );
            })
          ) {
            missedDays++;
          }
        }
      });

      if (missedDays > 0) {
        return Math.max(2, currentPoints - 2 * missedDays);
      }
      return currentPoints;
    };

    // Calc the next due date and reset the status and completions
    if (rule.interval && rule.interval > 0) {
      const currentMonthStart = startOfMonth(today);
      const daysInMonth = Array.from(
        { length: getDaysInMonth(today) },
        (_, i) => addDays(currentMonthStart, i)
      );

      // Calculate points only if there are actually missed days
      const newPoints = calculateMissedDaysPenalty(daysInMonth, task.points);
      setIfChanged("points", newPoints, task.points);

      const isCompletedToday = taskCompletedAt && isToday(taskCompletedAt);
      if (!isCompletedToday) {
        setIfChanged("status", "pending", task.status);
        setNestedIfChanged("repetitionRule.completions", 0, rule.completions);

        const nextDueDate = startOfDay(new Date(taskDueDate));
        if (isPast(nextDueDate) && !isToday(nextDueDate)) {
          if (!isSameMonth(taskDueDate, today)) {
            setNestedIfChanged(
              "repetitionRule.completedAt",
              [],
              rule.completedAt
            );
            setIfChanged("points", 10, task.points);
          }

          // Calculate new due date
          const newDueDate = new Date(nextDueDate);
          while (isPast(newDueDate) && !isToday(newDueDate)) {
            newDueDate.setDate(newDueDate.getDate() + rule.interval);
          }
          newDueDate.setHours(taskDueDate.getHours(), taskDueDate.getMinutes());

          if (newDueDate.getTime() !== taskDueDate.getTime()) {
            updates.dueDate = newDueDate;
          }
        }
      }
    } else if (rule.timesPerWeek) {
      const taskWeekStart = startOfWeek(taskStartDate, MONDAY_START_OF_WEEK);
      const weekDays = Array.from({ length: 7 }, (_, i) =>
        addDays(taskWeekStart, i)
      );

      // Calculate points only if there are actually missed days
      const newPoints = calculateMissedDaysPenalty(weekDays, task.points);
      setIfChanged("points", newPoints, task.points);

      if (isPast(taskDueDate)) {
        setIfChanged("status", "pending", task.status);
      }

      if (!isSameWeek(currentWeekStart, taskWeekStart, MONDAY_START_OF_WEEK)) {
        setIfChanged("status", "pending", task.status);
        setNestedIfChanged("repetitionRule.completions", 0, rule.completions);

        if (currentWeekStart.getTime() !== taskStartDate.getTime()) {
          updates.startDate = currentWeekStart;
        }

        setNestedIfChanged("repetitionRule.completedAt", [], rule.completedAt);
        setIfChanged("points", 10, task.points);

        const newDueDate = new Date(today);
        newDueDate.setHours(taskDueDate.getHours(), taskDueDate.getMinutes());

        // Only update if the date actually changed
        if (newDueDate.getTime() !== taskDueDate.getTime()) {
          updates.dueDate = newDueDate;
        }
      }
    } else if (rule.daysOfWeek.length > 0) {
      const taskWeekStart = startOfWeek(taskDueDate, MONDAY_START_OF_WEEK);
      const weekDays = Array.from({ length: 7 }, (_, i) =>
        addDays(taskWeekStart, i)
      );

      const newPoints = calculateMissedDaysPenalty(weekDays, task.points);
      setIfChanged("points", newPoints, task.points);

      if (isPast(taskDueDate)) {
        const todayDay = getDay(today) as DayOfWeek;
        const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b);

        let nextDueDay = sortedDays.find((day) => day >= todayDay);

        let daysUntilNext;
        if (nextDueDay !== undefined) {
          daysUntilNext = nextDueDay - todayDay;
        } else {
          nextDueDay = sortedDays[0];
          daysUntilNext = 7 - todayDay + nextDueDay;
        }

        const newDueDate = addDays(today, daysUntilNext);
        newDueDate.setHours(taskDueDate.getHours(), taskDueDate.getMinutes());

        if (newDueDate.getTime() !== taskDueDate.getTime()) {
          updates.dueDate = newDueDate;
        }
      }

      if (
        isPast(taskDueDate) &&
        !isSameWeek(currentWeekStart, taskWeekStart, MONDAY_START_OF_WEEK)
      ) {
        setIfChanged("status", "pending", task.status);
        setNestedIfChanged("repetitionRule.completions", 0, rule.completions);
        setNestedIfChanged("repetitionRule.completedAt", [], rule.completedAt);
        setIfChanged("points", 10, task.points);
      } else if (
        isPast(taskDueDate) &&
        isSameWeek(currentWeekStart, taskWeekStart, MONDAY_START_OF_WEEK)
      ) {
        setIfChanged("status", "pending", task.status);
      }
    }

    // Only calculate and update risk if there are other updates or if risk calculation might have changed
    if (Object.keys(updates).length > 0) {
      const tempTask = {
        ...task,
        ...updates,
      };

      const newRisk = isTaskAtRisk(tempTask);
      setIfChanged("risk", newRisk, task.risk);
    }

    // Only batch update if there are actual changes
    if (Object.keys(updates).length > 0) {
      batch.update(taskRef, updates);
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
        ", "
      )}) done updating for user: ${userId}.`
    );
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
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split("@")[0],
            picture: decodedToken.picture,
            email_verified: decodedToken.email_verified,
          };

          // ----- FIRESTORE USER DOCUMENT MANAGEMENT -----
          const userDocRef = adminDb.collection("users").doc(firebaseUser.uid);
          const userDocSnap = await userDocRef.get();
          let lastLoginAt: Timestamp | undefined;

          if (!userDocSnap.exists) {
            // ----- NEW USER CREATION -----
            // First time this Firebase user is signing in to our app
            // Create a new user document with default settings

            // Build user data object, filtering out undefined values to prevent Firestore errors
            const newUserData: Partial<AppUser> = {
              uid: firebaseUser.uid,
              provider: "firebase",
              createdAt: new Date(),
              notifyReminders: true,
              notifyAchievements: true,
              rewardPoints: 0,
              completedTasksCount: 0,
              currentStreak: 0,
              bestStreak: 0,
              achievements: [],
              gainedPoints: [],
              lastLoginAt: new Date(),
              ...(firebaseUser.email && { email: firebaseUser.email }),
              ...(firebaseUser.name && { displayName: firebaseUser.name }),
              ...(firebaseUser.picture && { photoURL: firebaseUser.picture }),
            };

            await userDocRef.set(newUserData);
            console.log(
              `New user document created in Firestore via Firebase Credentials:`,
              firebaseUser.uid
            );
          } else {
            // ----- EXISTING USER LOGIN HANDLING -----
            // User has signed in before - fetch their existing preferences and data
            const userData = userDocSnap.data();
            lastLoginAt = userData?.lastLoginAt;
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
            lastLoginAt: lastLoginAt?.toDate() || new Date(),
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
              createdAt: new Date(),
              rewardPoints: 0,
              notifyReminders: true,
              notifyAchievements: true,
              completedTasksCount: 0,
              currentStreak: 0,
              bestStreak: 0,
              achievements: [],
              gainedPoints: [],
              lastLoginAt: new Date(),
              ...(user.email && { email: user.email }),
              ...(user.name && { displayName: user.name }),
              ...(user.image && { photoURL: user.image }),
            };

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
            const lastLoginAt = userData?.lastLoginAt as Timestamp | undefined;
            const now = new Date();
            const today = startOfDay(now);

            // Check if more than 5 minutes have passed since the last recorded activity.
            if (
              !lastLoginAt ||
              now.getTime() - lastLoginAt.toDate().getTime() > 5 * 60 * 1000
            ) {
              const updates: {
                lastLoginAt: Timestamp;
                currentStreak?: number;
                bestStreak?: number;
              } = {
                lastLoginAt: Timestamp.now(),
              };

              // Calculate streak based on consecutive login days
              if (lastLoginAt) {
                const lastLoginDate = startOfDay(lastLoginAt.toDate());
                const diff = differenceInCalendarDays(today, lastLoginDate);

                if (diff === 1) {
                  // Consecutive day - increment streak
                  const newStreak = (userData.currentStreak || 0) + 1;
                  updates.currentStreak = newStreak;
                  updates.bestStreak = Math.max(
                    newStreak,
                    userData.bestStreak || 0
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

              // const tasks = await getTasksByUserId(token.uid);
              await Promise.all([
                userDocRef.update(updates),
                updateUserRepeatingTasks(token.uid),
                checkAndAwardAchievements(token.uid),
                //generateNotificationsForUser(token.uid, tasks),
              ]);
            }
          }
        } catch (error) {
          console.error(
            "Error during periodic maintenance in JWT callback:",
            error
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
