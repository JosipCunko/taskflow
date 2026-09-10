import { KeyRound } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/_lib/auth";
import ChangePasswordForm from "@/app/_components/profile/ChangePasswordForm";

export const metadata = {
  title: "Change Password",
  description: "Update your account password",
};

// This page is user-specific (session-based) and must not be cached.
export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  return (
    <div className="mx-auto container p-1 sm:p-6 pb-8 max-w-md">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <KeyRound className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">Change Password</span>
        </h1>
        <p className="text-text-low mt-2">
          Enter your current password and choose a new one.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
