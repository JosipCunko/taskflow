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
      // Example: window.location.href = '/dashboard';
    } else {
      throw new Error("No user returned from Firebase sign-in.");
    }
  } catch (error: any) {
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
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
