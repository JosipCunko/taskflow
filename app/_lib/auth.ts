import {
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUserType, // Renamed to avoid conflict
  // UserCredential, // We might not need to return this directly anymore
} from "firebase/auth";
import { auth } from "./firebase"; // Your client-side Firebase auth instance
import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react"; // NextAuth client functions
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, User as NextAuthUser, Session } from "next-auth";
import { adminAuth, adminDb } from "@/app/_lib/admin";
import { Timestamp } from "firebase-admin/firestore";

const googleProvider = new GoogleAuthProvider();

/**
 * Initiates Google Sign-In using Firebase, then signs into NextAuth.
 */
export const signInWithGoogle = async (): Promise<void> => {
  try {
    // 1. Sign in with Firebase client-side
    const result = await firebaseSignInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    console.log("auth", result);

    if (firebaseUser) {
      // 2. Get the Firebase ID token
      const idToken = await firebaseUser.getIdToken(true); // Pass true to force refresh

      // 3. Sign into NextAuth.js using the 'credentials' provider
      //    This will trigger the `authorize` function in
      const nextAuthResult = await nextAuthSignIn("credentials", {
        idToken,
        redirect: false, // Prevent NextAuth from redirecting, handle manually if needed
      });
      console.log("auth", nextAuthResult);

      if (nextAuthResult?.error) {
        console.error("NextAuth sign-in error:", nextAuthResult.error);
        // Optionally, sign out from Firebase if NextAuth sign-in fails to keep states consistent
        await firebaseSignOut(auth);
        throw new Error(nextAuthResult.error);
      }

      console.log("Successfully signed in with Firebase and NextAuth.");
      // At this point, the Firestore user document creation/update is handled
      // by the `authorize` callback in your NextAuth configuration.
      // You can redirect or update UI state as needed.
      window.location.href = "/webapp";
    } else {
      throw new Error("No user returned from Firebase sign-in.");
    }
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request")
    ) {
      console.warn("Firebase sign-in popup closed or cancelled.");
    } else {
      console.error("Error during Google sign-in flow:", error);
    }
    throw error; // Re-throw for the component to handle
  }
};

/**
 * Signs out from NextAuth and Firebase.
 */
export const signOut = async (): Promise<void> => {
  try {
    // 1. Sign out from NextAuth (clears the session cookie)
    // `callbackUrl` tells NextAuth where to redirect after sign-out.
    await nextAuthSignOut({ redirect: false, callbackUrl: "/login" });

    // 2. Sign out from Firebase client-side
    await firebaseSignOut(auth);

    console.log("User signed out successfully from NextAuth and Firebase.");
    // Manually redirect if needed, as redirect:false was used for nextAuthSignOut
    window.location.href = "/login";
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Observes Firebase client-side authentication state changes.
 * This can be useful for client-side UI updates that need to react
 * instantly to Firebase state, but `useSession` from NextAuth
 * should be the primary source of truth for session status.
 * @param {(user: FirebaseUserType | null) => void} callback - Function to call when auth state changes.
 * @returns {import("firebase/auth").Unsubscribe} Unsubscribe function.
 */
export const onFirebaseAuthStateChanged = (
  callback: (user: FirebaseUserType | null) => void
) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Gets the current Firebase authenticated user (client-side).
 * @returns {FirebaseUserType | null} The current Firebase user or null.
 */
export const getCurrentFirebaseUser = (): FirebaseUserType | null => {
  return auth.currentUser;
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
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials: Record<"idToken", string> | undefined) {
        if (!credentials?.idToken) {
          console.error("No ID token provided to authorize");
          return null;
        }

        try {
          // 1. Verify the Firebase ID token using Firebase Admin SDK
          const decodedToken = await adminAuth.verifyIdToken(
            credentials.idToken
          );
          if (!decodedToken || !decodedToken.uid) {
            console.error("Failed to verify ID token or UID missing");
            return null;
          }

          // 2. Token is verified, extract user info
          const firebaseUser: FirebaseUser = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email?.split("@")[0], // Fallback for name
            picture: decodedToken.picture,
            email_verified: decodedToken.email_verified,
          };

          // 3. Check if user exists in your Firestore 'users' collection, or create/update them
          const userDocRef = adminDb.collection("users").doc(firebaseUser.uid);
          const userDocSnap = await userDocRef.get();

          // if (!userDocSnap.exists()) {
          if (!userDocSnap.exists) {
            // New user: create their document in Firestore
            await userDocRef.set({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.name,
              photoURL: firebaseUser.picture,
              createdAt: Timestamp.now(), // Use admin.firestore.Timestamp
            });
            console.log(
              "New user document created in Firestore via NextAuth:",
              firebaseUser.uid
            );
          } else {
            // Existing user: fetch their reward points
            // You might also want to update displayName or photoURL if they changed in Google
            //const existingData = userDocSnap.data();
            await userDocRef.update({
              // Optionally update fields
              displayName: firebaseUser.name,
              photoURL: firebaseUser.picture,
              lastLoginAt: Timestamp.now(), // Example: track last login
            });
          }

          // 4. Return the user object for NextAuth session
          // This object will be available in the `jwt` callback `token` parameter (if new sign in) or `user` parameter
          return {
            id: firebaseUser.uid, // This will be `token.sub` and `session.user.id`
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
    // async jwt({ token, user, account, profile, trigger }) {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user: NextAuthUser | AdapterUser;
    }) {
      // `user` is only passed on initial sign-in.
      // `account` & `profile` are also only available at sign-in.
      if (user) {
        // This block runs on sign-in
        token.uid = user.id; // user.id is the `id` from `authorize` function (Firebase UID)
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image; // user.image is `picture` from `authorize`
      }
      // you could add logic here, e.g., on `trigger === "update"` or based on JWT expiry.
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client, e.g., an access token, user data from JWT
      if (token) {
        session.user.id = token.uid as string; // Firebase UID
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Redirect users to /login if trying to access protected pages
  },
  // Optional: Add debug true for development
  // debug: process.env.NODE_ENV === 'development',
};
