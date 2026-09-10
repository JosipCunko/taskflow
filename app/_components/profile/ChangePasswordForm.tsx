"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/app/_components/reusable/Button";
import Input from "@/app/_components/reusable/Input";
import { changePasswordFirebase } from "@/app/_lib/auth-client";
import { successToast, errorToast } from "@/app/_utils/utils";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setIsLoading(true);
    try {
      await changePasswordFirebase(currentPassword, newPassword);
      successToast("Password updated successfully.");
      router.push("/webapp/profile");
    } catch (errUnknown: unknown) {
      const err = errUnknown as { code?: string; message?: string };
      let errorMessage = "Failed to update password.";
      switch (err.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "Your current password is incorrect.";
          break;
        case "auth/weak-password":
          errorMessage =
            "New password is too weak. It should be at least 6 characters.";
          break;
        case "auth/too-many-requests":
          errorMessage =
            "Too many attempts. Please wait a bit before trying again.";
          break;
        case "auth/requires-recent-login":
          errorMessage =
            "This action requires a recent sign-in. Please sign out and sign back in, then try again.";
          break;
        default:
          if (err.message) errorMessage = err.message;
          break;
      }
      setError(errorMessage);
      errorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-surface rounded-lg p-4 sm:p-6 border border-divider">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm text-text-low mb-1">
            Current Password
          </label>
          <Input
            type="password"
            id="currentPassword"
            name="currentPassword"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm text-text-low mb-1">
            New Password
          </label>
          <Input
            type="password"
            id="newPassword"
            name="newPassword"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm text-text-low mb-1">
            Confirm New Password
          </label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-background-600 p-2 rounded">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full justify-center py-2" disabled={isLoading}>
          {isLoading ? "Updating..." : "Change Password"}
        </Button>
      </form>

      <Link
        href="/webapp/profile"
        className="mt-4 inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
      >
        <ArrowLeft size={16} />
        Back to profile
      </Link>
    </div>
  );
}
