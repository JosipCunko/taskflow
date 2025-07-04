import "server-only";
import admin from "firebase-admin";

const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG;

if (!serviceAccountString) {
  throw new Error("FIREBASE_ADMIN_SDK_CONFIG environment variable is not set.");
}

try {
  // Parse the stringified JSON from the environment variable
  const serviceAccount = JSON.parse(serviceAccountString);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.stack : "Unknown error";
  console.error("Firebase Admin SDK initialization error:", errorMessage);
  throw new Error(
    "Could not initialize Firebase Admin SDK. Is FIREBASE_ADMIN_SDK_CONFIG a valid JSON string?"
  );
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore(); //Admin access to Firestore
/*
The Admin SDK is initialized with service account credentials, granting it privileged access to your database, bypassing the security rules entirely. This is a secure and standard practice for server-to-server communication with Firebase.
*/
