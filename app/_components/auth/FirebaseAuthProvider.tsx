"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth } from "@/app/_lib/firebase";

type Props = {
  children?: React.ReactNode;
};

export default function FirebaseAuthProvider({ children }: Props) {
  const { status, data: session } = useSession();
  const signedIn = useRef(false);

  useEffect(() => {
    const signIn = async () => {
      // Check if we need to sync Firebase with NextAuth
      const currentFirebaseUser = auth.currentUser;
      const nextAuthUserId = session?.user?.id;

      // If Firebase user doesn't match NextAuth user, we need to sync
      if (currentFirebaseUser?.uid !== nextAuthUserId) {
        try {
          const response = await fetch("/api/auth/firebase-token");
          if (response.ok) {
            const data = await response.json();
            if (data.firebaseToken) {
              // Sign out current Firebase user first if different
              if (currentFirebaseUser) {
                await signOut(auth);
                await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay
              }

              await signInWithCustomToken(auth, data.firebaseToken);
              signedIn.current = true;
              console.log(
                "Firebase synced with NextAuth user:",
                nextAuthUserId
              );
            }
          }
        } catch (error) {
          console.error("Error syncing Firebase with NextAuth:", error);
        }
      } else if (currentFirebaseUser) {
        // Firebase is already in sync
        signedIn.current = true;
      }
    };

    const signUserOut = async () => {
      try {
        await signOut(auth);
        signedIn.current = false;
      } catch (error) {
        console.error("Error signing out from Firebase:", error);
      }
    };

    if (status === "authenticated" && session?.user?.id) {
      signIn();
    } else if (status === "unauthenticated" && signedIn.current) {
      signUserOut();
    }
  }, [status, session?.user?.id]);

  return <>{children}</>;
}
