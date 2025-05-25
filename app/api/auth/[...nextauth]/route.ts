// app/api/auth/[...nextauth]/route.ts
import NextAuth, {
  NextAuthOptions,
  User as NextAuthUser,
  // Account,
  // Profile,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminAuth, adminDb } from "@/app/_lib/admin";
import { Timestamp } from "firebase-admin/firestore"; // For server-side Firestore operations

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
      async authorize(credentials) {
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
    async jwt({ token, user }) {
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
    async session({ session, token }) {
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
