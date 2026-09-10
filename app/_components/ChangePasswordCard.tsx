"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { auth } from "@/app/_lib/firebase";

/**
 * Card link to the change-password page, styled like the "Contact Us" card.
 * Only rendered for accounts that actually have a Firebase email/password
 * credential — Google, GitHub, and anonymous accounts have no password to change.
 */
export default function ChangePasswordCard() {
  const [canChangePassword, setCanChangePassword] = useState(false);

  useEffect(() => {
    const checkPasswordProvider = () => {
      const user = auth.currentUser;
      setCanChangePassword(
        !!user?.providerData?.some(
          (providerInfo) => providerInfo.providerId === "password"
        )
      );
    };

    checkPasswordProvider();
    const unsubscribe = auth.onAuthStateChanged(checkPasswordProvider);
    return unsubscribe;
  }, []);

  if (!canChangePassword) return null;

  return (
    <Link
      href="/webapp/profile/change-password"
      className="rounded-lg p-4 sm:p-6 border-2 border-divider flex items-center gap-3 transition hover:scale-105 duration-200"
    >
      <KeyRound className="text-primary" />
      <div>
        <h3 className="text-lg font-bold text-primary drop-shadow">
          Change Password
        </h3>
        <span className="block text-xs whitespace-nowrap text-text-low">
          Update your account password.
        </span>
      </div>
    </Link>
  );
}
