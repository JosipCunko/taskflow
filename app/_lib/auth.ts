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
type UserWithRewardPoints = (NextAuthUser | AdapterUser) & {
  rewardPoints?: number;
};

interface FirebaseUser {
  // Define the expected structure from Firebase ID token
  uid: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  email_verified?: boolean;
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
          let rewardPoints = 0; // Default for new user

          if (!userDocSnap.exists) {
            await userDocRef.set({
              uid: firebaseUser.uid, // This is Firebase UID
              email: firebaseUser.email,
              displayName: firebaseUser.name,
              photoURL: firebaseUser.picture,
              provider: "firebase", // Indicate provider
              createdAt: Timestamp.now(),
              rewardPoints: 0, // Initialize rewardPoints
            });
          } else {
            // Existing user, fetch their rewardPoints
            rewardPoints = userDocSnap.data()?.rewardPoints || 0;
            await userDocRef.update({
              displayName: firebaseUser.name,
              photoURL: firebaseUser.picture,
              lastLoginAt: Timestamp.now(),
            });
          }
          // Ensure the returned user object shape matches NextAuthUser & your extended User type
          const returnedUser: UserWithRewardPoints = {
            id: firebaseUser.uid,
            name: firebaseUser.name,
            email: firebaseUser.email,
            image: firebaseUser.picture,
            rewardPoints: rewardPoints,
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
        let rewardPoints = 0; // Default for new user

        if (!userDocSnap.exists) {
          // New user via OAuth, create their document in Firestore
          try {
            await userDocRef.set({
              uid: user.id, // Store NextAuth user.id (e.g., GitHub user ID string)
              email: user.email,
              displayName: user.name,
              photoURL: user.image,
              provider: account.provider,
              createdAt: Timestamp.now(),
              rewardPoints: 0, // Initialize rewardPoints
            });
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
          rewardPoints = userDocSnap.data()?.rewardPoints || 0;
          try {
            await userDocRef.update({
              displayName: user.name, // Update name/image in case it changed on provider
              photoURL: user.image,
              lastLoginAt: Timestamp.now(),
              // rewardPoints are managed by task updates
            });
          } catch (dbError) {
            console.error("Firestore error during OAuth user update:", dbError);
            // Don't prevent sign-in for update failures, but log it.
          }
        }
        // Attach rewardPoints to the user object to be used in the JWT callback
        (user as UserWithRewardPoints).rewardPoints = rewardPoints;
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
        const userWithRewards = user as UserWithRewardPoints;
        if (typeof userWithRewards.rewardPoints === "number") {
          token.rewardPoints = userWithRewards.rewardPoints;
        } else {
          // const userDocRef = adminDb.collection("users").doc(user.id);
          // const userDocSnap = await userDocRef.get();
          // token.rewardPoints = userDocSnap.exists() ? userDocSnap.data()?.rewardPoints || 0 : 0;
          token.rewardPoints = 0; // Defaulting to 0 if not on user object for now
        }
      }
      // For subsequent JWT calls (e.g., session refresh), user and account are undefined.
      // If rewardPoints can change and need to be fresh in JWT always, fetch here using token.uid.
      // For now, assuming rewardPoints are set at login and updated in session by client-side triggers.
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

        // rewardPoints is number | undefined on JWT and Session.user
        if (typeof token.rewardPoints === "number") {
          session.user.rewardPoints = token.rewardPoints;
        } else {
          session.user.rewardPoints = undefined; // Or 0 as a default if preferred
        }
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
