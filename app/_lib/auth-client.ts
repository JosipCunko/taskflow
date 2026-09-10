import {
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUserType,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  signInAnonymously as firebaseSignInAnonymously,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential as firebaseReauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
} from "firebase/auth";
import { auth } from "./firebase";
import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";
import { redirect } from "next/navigation";
import { SITE_URL } from "./site";

const googleProvider = new GoogleAuthProvider();
const POST_AUTH_CALLBACK_URL = "/webapp";

/**
 * Continue URL that Firebase's verification email links back to.
 * Must be an authorized domain in the Firebase console.
 */
const EMAIL_VERIFICATION_CONTINUE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/login?verified=1"
    : `${SITE_URL}/login?verified=1`;

/**
 * Continue URL that Firebase's password reset email links back to after the user sets a new password on Firebase's hosted reset page.
 */
const PASSWORD_RESET_CONTINUE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/login?reset=1"
    : `${SITE_URL}/login?reset=1`;

/**
 * Exchange a Firebase ID token for a NextAuth session.
 * Always pass a clean callbackUrl — NextAuth v4 otherwise uses window.location.href,
 * so a leftover ?error=OAuthCallback from a failed GitHub attempt is treated as a
 * credentials failure even when authorize() succeeded.
 */
async function signIntoNextAuthWithIdToken(idToken: string): Promise<void> {
  const nextAuthResult = await nextAuthSignIn("credentials", {
    idToken,
    redirect: false,
    callbackUrl: POST_AUTH_CALLBACK_URL,
  });

  if (nextAuthResult?.error) {
    console.error("NextAuth sign-in error:", nextAuthResult.error);
    await firebaseSignOut(auth);
    throw new Error(nextAuthResult.error);
  }
}

/**
 * Initiates Google Sign-In using Firebase, then signs into NextAuth.
 */
export const signInWithGoogle = async (): Promise<void> => {
  try {
    // 0. Ensure Firebase is signed out first to prevent race conditions
    // This is crucial when switching from anonymous to Google auth
    if (auth.currentUser) {
      await firebaseSignOut(auth);
      // Small delay to ensure Firebase state is fully cleared
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 1. Sign in with Firebase client-side
    const result = await firebaseSignInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken(true);
      // Triggers authorize function
      await signIntoNextAuthWithIdToken(idToken);
      redirect(POST_AUTH_CALLBACK_URL);
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
 * Creates a new user with email and password using Firebase, optionally updates their display name,
 * then sends a verification email. Does NOT sign the user into NextAuth — the account isn't usable until the email address is verified (see signInWithEmailAndPasswordFirebase and authorize() in auth.ts).
 */
export const signUpWithEmailAndPasswordFirebase = async (
  email: string,
  password: string,
  displayName?: string
): Promise<void> => {
  try {
    // 1. Create user with Firebase client-side
    const userCredential = await firebaseCreateUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    if (firebaseUser) {
      // 2. Optionally update Firebase user's display name
      if (displayName) {
        try {
          await firebaseUpdateProfile(firebaseUser, { displayName });
          console.log("Firebase profile updated with displayName.");
        } catch (profileError) {
          console.error("Error updating Firebase profile:", profileError);
          // Continue even if profile update fails, user is already created
        }
      }

      // 3. Send verification email — the user must click the link before they
      // can sign in (see authorize() server-side check).
      try {
        await firebaseSendEmailVerification(firebaseUser, {
          url: EMAIL_VERIFICATION_CONTINUE_URL,
          handleCodeInApp: false,
        });
      } catch (verificationError) {
        console.error(
          "Error sending verification email:",
          verificationError
        );
      }

      // 4. Do NOT sign into NextAuth yet — sign out of Firebase client-side and let the caller (LoginForm) tell the user to check their inbox.
      await firebaseSignOut(auth);
    } else {
      throw new Error("No user returned from Firebase user creation.");
    }
  } catch (error: unknown) {
    console.error("Error during email/password sign-up flow:", error);
    throw error;
  }
};

/**
 * Resends the verification email for an unverified account.
 * We never keep an unverified user signed into Firebase so this briefly signs in with the given credentials just to call sendEmailVerification, then signs back out immediately.
 */
export const resendVerificationEmail = async (
  email: string,
  password: string
): Promise<void> => {
  const userCredential = await firebaseSignInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const firebaseUser = userCredential.user;
  try {
    await firebaseUser.reload();
    if (firebaseUser.emailVerified) {
      // Nothing to resend — already verified.
      return;
    }
    await firebaseSendEmailVerification(firebaseUser, {
      url: EMAIL_VERIFICATION_CONTINUE_URL,
      handleCodeInApp: false,
    });
  } finally {
    await firebaseSignOut(auth);
  }
};

/**
 * Firebase's own hosted page handles setting the new password; once done it redirects the user to PASSWORD_RESET_CONTINUE_URL.
 */
export const sendPasswordResetFirebase = async (
  email: string
): Promise<void> => {
  await firebaseSendPasswordResetEmail(auth, email, {
    url: PASSWORD_RESET_CONTINUE_URL,
    handleCodeInApp: false,
  });
};

/**
 * Firebase requires a "recent login" to allow sensitive operations like updatePassword, so we re-authenticate with the current password first.
 */
export const changePasswordFirebase = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser || !firebaseUser.email) {
    throw new Error(
      "No signed-in email/password account found. Please sign in again."
    );
  }

  const credential = EmailAuthProvider.credential(
    firebaseUser.email,
    currentPassword
  );

  // Re-authenticate to satisfy Firebase's recent-login requirement, and to
  // verify the user actually knows their current password.
  await firebaseReauthenticateWithCredential(firebaseUser, credential);
  await firebaseUpdatePassword(firebaseUser, newPassword);
};

/**
 * Signs in an existing user with email and password using Firebase, then signs into NextAuth.
 * Blocks sign-in (and signs the user back out) if their email/password account has not
 * verified its email address yet. The definitive check happens server-side in authorize(),
 * but this avoids a round trip and gives a friendlier error message.
 */
export const signInWithEmailAndPasswordFirebase = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    // 1. Sign in with Firebase client-side
    const userCredential = await firebaseSignInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    if (firebaseUser) {
      // 2. Make sure we have the freshest emailVerified status — the cached
      // user object can be stale if they just clicked the verification link
      // in another tab.
      await firebaseUser.reload();
      if (!firebaseUser.emailVerified) {
        try {
          await firebaseSendEmailVerification(firebaseUser, {
            url: EMAIL_VERIFICATION_CONTINUE_URL,
            handleCodeInApp: false,
          });
        } catch (resendError) {
          console.error(
            "Error resending verification email during blocked sign-in:",
            resendError
          );
        }
        await firebaseSignOut(auth);
        throw new Error("Please verify your email before signing in.");
      }

      // 3. Get a fresh Firebase ID token (forces refresh so email_verified is current)
      const idToken = await firebaseUser.getIdToken(true);
      await signIntoNextAuthWithIdToken(idToken);
      redirect(POST_AUTH_CALLBACK_URL);
    } else {
      throw new Error("No user returned from Firebase sign-in.");
    }
  } catch (error: unknown) {
    console.error("Error during email/password sign-in flow:", error);
    throw error;
  }
};

/**
 * Signs in anonymously using Firebase, then signs into NextAuth.
 * The account will be temporary and can be automatically deleted after a period.
 */
export const signInAnonymously = async (): Promise<void> => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    const firebaseUser = userCredential.user;

    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken(true);
      await signIntoNextAuthWithIdToken(idToken);
      redirect(POST_AUTH_CALLBACK_URL);
    } else {
      throw new Error("No user returned from Firebase anonymous sign-in.");
    }
  } catch (error: unknown) {
    console.error("Error during anonymous sign-in flow:", error);
    throw error;
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
