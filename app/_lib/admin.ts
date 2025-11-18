import "server-only";
import admin from "firebase-admin";

// Don't initialize Firebase Admin during build time (when env vars might not be available)
const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  (process.env.NODE_ENV === "production" &&
    !process.env.FIREBASE_ADMIN_SDK_CONFIG);

if (!isBuildTime) {
  const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG;

  if (!serviceAccountString) {
    throw new Error(
      "FIREBASE_ADMIN_SDK_CONFIG environment variable is not set."
    );
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
}

// Helper function to ensure admin is initialized at runtime
function getAdminAuth() {
  if (!admin.apps.length) {
    throw new Error(
      "Firebase Admin SDK is not initialized. Make sure FIREBASE_ADMIN_SDK_CONFIG is set at runtime."
    );
  }
  return admin.auth();
}

function getAdminDb() {
  if (!admin.apps.length) {
    throw new Error(
      "Firebase Admin SDK is not initialized. Make sure FIREBASE_ADMIN_SDK_CONFIG is set at runtime."
    );
  }
  return admin.firestore();
}

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get: (target, prop: string | symbol) => {
    const auth = getAdminAuth();
    const value = auth[prop as keyof admin.auth.Auth];
    return typeof value === "function" ? value.bind(auth) : value;
  },
});

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get: (target, prop: string | symbol) => {
    const db = getAdminDb();
    const value = db[prop as keyof admin.firestore.Firestore];
    return typeof value === "function" ? value.bind(db) : value;
  },
}); //Admin access to Firestore
/*
The Admin SDK is initialized with service account credentials, granting it privileged access to your database, bypassing the security rules entirely. This is a secure and standard practice for server-to-server communication with Firebase.
*/
