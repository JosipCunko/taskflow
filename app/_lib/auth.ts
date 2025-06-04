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
          if (!userDocSnap.exists) {
            await userDocRef.set({
              uid: firebaseUser.uid, // This is Firebase UID
              email: firebaseUser.email,
              displayName: firebaseUser.name,
              photoURL: firebaseUser.picture,
              provider: "firebase", // Indicate provider
              createdAt: Timestamp.now(),
            });
          } else {
            await userDocRef.update({
              displayName: firebaseUser.name,
              photoURL: firebaseUser.picture,
              lastLoginAt: Timestamp.now(),
            });
          }
          return {
            id: firebaseUser.uid, // Use Firebase UID as id for this provider
            name: firebaseUser.name,
            email: firebaseUser.email,
            image: firebaseUser.picture,
          } as NextAuthUser;
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
          try {
            await userDocRef.update({
              displayName: user.name, // Update name/image in case it changed on provider
              photoURL: user.image,
              lastLoginAt: Timestamp.now(),
            });
          } catch (dbError) {
            console.error("Firestore error during OAuth user update:", dbError);
            // Don't prevent sign-in for update failures, but log it.
          }
        }
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
      if (account && user) {
        token.uid = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.provider = account.provider; // account.provider is string
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.uid as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        (
          session.user as {
            id: string;
            provider?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
          }
        ).provider = token.provider as string | undefined;
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
