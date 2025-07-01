"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth } from "@/app/_lib/firebase";

type Props = {
  children?: React.ReactNode;
};

export default function FirebaseAuthProvider({ children }: Props) {
  const { status } = useSession();
  const signedIn = useRef(false);

  useEffect(() => {
    const signIn = async () => {
      const response = await fetch("/api/auth/firebase-token");
      if (response.ok) {
        const data = await response.json();
        if (data.firebaseToken) {
          try {
            await signInWithCustomToken(auth, data.firebaseToken);
            signedIn.current = true;
          } catch (error) {
            console.error("Error signing in with custom token:", error);
          }
        }
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

    if (status === "authenticated" && !signedIn.current) {
      signIn();
    } else if (status === "unauthenticated" && signedIn.current) {
      signUserOut();
    }
  }, [status]);

  return <>{children}</>;
}
