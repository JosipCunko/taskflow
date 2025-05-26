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
      // Optional: databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com' if using Realtime Database
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
export const adminDb = admin.firestore(); // If you need admin access to Firestore
