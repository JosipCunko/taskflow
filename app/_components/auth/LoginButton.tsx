"use client";

import { useSession } from "next-auth/react";
import { signInWithGoogle, signOut } from "@/app/_lib/auth-client";
import { useRouter } from "next/navigation"; // For App Router
import Button from "../reusable/Button";
import { Session } from "next-auth";

interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    rewardPoints?: number;
  };
}

export default function LoginButton() {
  const { data: session, status } = useSession() as {
    data: ExtendedSession | null;
    status: string;
  };
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      // After successful signInWithGoogle (which includes NextAuth sign-in),
      // NextAuth's useSession will eventually update.
      // You might want to redirect or wait for session status to change.
      // For now, let's assume a redirect happens or UI updates based on session.
      router.push("/dashboard"); // Example redirect
    } catch (error) {
      console.error("Sign-in failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  if (status === "loading") {
    return (
      <Button className="px-4 py-2 bg-gray-600 rounded text-white" disabled>
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sm">
          {session.user?.name} ({session.user?.rewardPoints || 0} pts)
        </p>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
    >
      Sign in with Google
    </button>
  );
}
