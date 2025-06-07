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

// Define a combined type for user objects that will hold rewardPoints
type UserWithExtendedData = (NextAuthUser | AdapterUser) & {
  rewardPoints: number;
  notifyReminders: boolean;
  notifyAchievements: boolean;
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
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface FirestoreUpdateData {
  lastLoginAt: Timestamp;
  displayName?: string | null;
  photoURL?: string | null;
}

/**
 * CredentialsProvider: We use this because Firebase client SDK handles the OAuth dance with Google. We then pass the idToken from Firebase to this provider.
authorize function:
Receives the idToken.
Uses adminAuth.verifyIdToken() to securely check if the token is valid and not tampered with. This is a critical security step.
If valid, it extracts user info.
It interacts with your Firestore users collection:
Checks if the user (by UID) exists.
If not, it creates a new user document (similar to what you had in signInWithGoogle but now server-side).
Returns a user object that NextAuth.js will use to build the JWT and session. The id property here becomes token.sub and session.user.id.
session: { strategy: "jwt" }: We're using JSON Web Tokens for session management.
callbacks.jwt: This callback is invoked whenever a JWT is created (on sign-in) or updated.
On initial sign-in (when user object from authorize is present), we transfer uid, email, name and picture into the token.
callbacks.session: This callback is invoked when a session is checked.
It takes the token (from the jwt callback) and shapes the session.user object that will be available on the client via useSession() or getServerSession().
pages.signIn: If a user tries to access a protected route without being authenticated, NextAuth.js will redirect them to /login. Create this page later.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials: Record<"idToken", string> | undefined) {
        if (!credentials?.idToken) {
          console.error("No ID token provided to authorize for Firebase");
          return null;
        }
        // Firebase ID Token verification logic (this is specific to your email/pass & Google via Firebase SDK flow)
        try {
          const decodedToken = await adminAuth.verifyIdToken(
            credentials.idToken
          );
          if (!decodedToken || !decodedToken.uid) {
            console.error("Failed to verify Firebase ID token or UID missing");
            return null;
          }
          const firebaseUser: FirebaseUser = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split("@")[0],
            picture: decodedToken.picture,
            email_verified: decodedToken.email_verified,
          };

          // Firestore user creation/update for Firebase authenticated users
          const userDocRef = adminDb.collection("users").doc(firebaseUser.uid);
          const userDocSnap = await userDocRef.get();
          let rewardPoints = 0;
          let notifyReminders = true;
          let notifyAchievements = true;

          if (!userDocSnap.exists) {
            // Filter out undefined values before setting the document
            const newUserData: Partial<FirestoreUserData> = {
              uid: firebaseUser.uid, // This is Firebase UID
              provider: "firebase",
              createdAt: Timestamp.now(),
              rewardPoints: 0,
              notifyReminders: true,
              notifyAchievements: true,
            };

            if (firebaseUser.email !== undefined) {
              newUserData.email = firebaseUser.email;
            }
            if (firebaseUser.name !== undefined) {
              newUserData.displayName = firebaseUser.name;
            }
            if (firebaseUser.picture !== undefined) {
              newUserData.photoURL = firebaseUser.picture;
            }

            await userDocRef.set(newUserData);
          } else {
            // Existing user, fetch their rewardPoints
            const userData = userDocSnap.data();
            rewardPoints = userData?.rewardPoints || 0;
            notifyReminders = userData?.notifyReminders ?? true;
            notifyAchievements = userData?.notifyAchievements ?? true;

            // Filter out undefined values before updating the document
            const updateData: Partial<FirestoreUpdateData> = {
              lastLoginAt: Timestamp.now(),
            };

            if (firebaseUser.name !== undefined) {
              updateData.displayName = firebaseUser.name;
            }
            if (firebaseUser.picture !== undefined) {
              updateData.photoURL = firebaseUser.picture;
            }

            await userDocRef.update(updateData);
          }
          // Ensure the returned user object shape matches NextAuthUser & your extended User type
          const returnedUser = {
            id: firebaseUser.uid,
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
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account && user.email) {
        // For OAuth providers like GitHub
        const userDocRef = adminDb.collection("users").doc(user.id); // Use NextAuth user.id (which can be provider's ID)
        const userDocSnap = await userDocRef.get();
        let rewardPoints = 0;
        let notifyReminders = true;
        let notifyAchievements = true;

        if (!userDocSnap.exists) {
          // New user via OAuth, create their document in Firestore
          try {
            // Filter out undefined values before setting the document
            const newUserData: Partial<FirestoreUserData> = {
              uid: user.id, // Store NextAuth user.id (e.g., GitHub user ID string)
              provider: account.provider,
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
          // Existing OAuth user, update last login or other details if needed
          // Fetch existing rewardPoints
          const userData = userDocSnap.data();
          rewardPoints = userData?.rewardPoints || 0;
          notifyReminders = userData?.notifyReminders ?? true;
          notifyAchievements = userData?.notifyAchievements ?? true;

          try {
            // Filter out undefined values before updating the document
            const updateData: Partial<FirestoreUpdateData> = {
              lastLoginAt: Timestamp.now(),
            };

            if (user.name !== undefined) {
              updateData.displayName = user.name;
            }
            if (user.image !== undefined) {
              updateData.photoURL = user.image;
            }

            await userDocRef.update(updateData);
          } catch (dbError) {
            console.error("Firestore error during OAuth user update:", dbError);
            // Don't prevent sign-in for update failures, but log it.
          }
        }
        // Attach rewardPoints to the user object to be used in the JWT callback
        const extendedUser = user as UserWithExtendedData;
        extendedUser.rewardPoints = rewardPoints;
        extendedUser.notifyReminders = notifyReminders;
        extendedUser.notifyAchievements = notifyAchievements;
      }
      return true; // Allow sign-in
    },
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: NextAuthUser | AdapterUser;
      account?: Account | null;
    }) {
      // user parameter is the user object from authorize or signIn callbacks (or AdapterUser)
      // account parameter is only passed on initial sign-in
      if (account && user) {
        // This is an initial sign-in
        token.uid = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.provider = account.provider;

        // User object from signIn/authorize should have rewardPoints by now
        const userWithRewards = user as UserWithExtendedData;
        if (typeof userWithRewards.rewardPoints === "number") {
          token.rewardPoints = userWithRewards.rewardPoints;
        } else {
          token.rewardPoints = 0; // Defaulting to 0 if not on user object for now
        }
        token.notifyReminders = userWithRewards.notifyReminders ?? true;
        token.notifyAchievements = userWithRewards.notifyAchievements ?? true;
      } else if (token.uid) {
        // For subsequent JWT calls, fetch fresh rewardPoints from database
        // This ensures rewardPoints are always up-to-date
        try {
          const userDocRef = adminDb.collection("users").doc(token.uid);
          const userDocSnap = await userDocRef.get();

          if (userDocSnap.exists) {
            const userData = userDocSnap.data();
            token.rewardPoints = userData?.rewardPoints || 0;
            token.notifyReminders = userData?.notifyReminders ?? true;
            token.notifyAchievements = userData?.notifyAchievements ?? true;
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error);
          // Keep existing values if fetch fails
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        if (token.uid) session.user.id = token.uid;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;

        // provider is string | undefined on JWT and Session.user
        if (token.provider) session.user.provider = token.provider;

        // Ensure required properties are always set with proper defaults
        session.user.rewardPoints = token.rewardPoints ?? 0;
        session.user.notifyReminders = token.notifyReminders ?? true;
        session.user.notifyAchievements = token.notifyAchievements ?? true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  // Optional: Add debug true for development
  // debug: process.env.NODE_ENV === 'development',
};
