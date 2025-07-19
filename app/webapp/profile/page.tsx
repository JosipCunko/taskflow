import ProfileTabs from "@/app/_components/ProfileTabs";
import UserInfoCard from "@/app/_components/UserInfoCard";

import { User } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getRecentUserActivity } from "@/app/_lib/activity";
import { AppUser } from "@/app/_types/types";
import { authOptions } from "@/app/_lib/auth";
import { loadNotesByUserId } from "@/app/_lib/notes";
import { getUserById } from "@/app/_lib/user-admin";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }
  const userFromToken = session.user;
  const [user, recentActivityLogs, notes] = await Promise.all([
    getUserById(userFromToken.id),
    getRecentUserActivity(userFromToken.id, 7),
    loadNotesByUserId(userFromToken.id),
  ]);
  if (!user) {
    redirect("/login");
  }

  const userProfileData = {
    ...user,
    notesCount: notes.length,
  } as AppUser;

  return (
    <div className="mx-auto container max-h-full p-1 sm:p-6 space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <User className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">My Profile</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 ">
        <UserInfoCard user={userProfileData} />
        <ProfileTabs activityLogs={recentActivityLogs} user={userProfileData} />
      </div>
    </div>
  );
}
