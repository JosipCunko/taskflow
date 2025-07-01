import ProfileTabs from "@/app/_components/ProfileTabs";
import { User } from "lucide-react";
import { getServerSession } from "next-auth";
import UserInfoCard from "@/app/_components/UserInfoCard";
import { redirect } from "next/navigation";
import { getRecentUserActivity } from "@/app/_lib/activity";
import { ActivityLog } from "@/app/_types/types";
import { authOptions } from "@/app/_lib/auth";
import { loadNotesByUserId } from "@/app/_lib/notes";
import { getUserById } from "@/app/_lib/user-admin";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [userData, recentActivityLogs, notes] = await Promise.all([
    getUserById(userId),
    getRecentUserActivity(userId, 7),
    loadNotesByUserId(userId),
  ]);

  const memberSince = userData?.createdAt;
  if (!userData) redirect("/login");

  const userProfileData = {
    displayName: userData.displayName || session.user.name || "User",
    email: userData.email || session.user.email || "",
    photoURL: userData.photoURL || session.user.image || "",
    rewardPoints: userData.rewardPoints || 0,
    memberSince: memberSince || new Date(),
    id: userId,
    notifyReminders: userData.notifyReminders ?? true,
    notifyAchievements: userData.notifyAchievements ?? true,
    notesCount: notes.length,
    achievements: userData.achievements,
  };
  console.log(userProfileData);
  return (
    <div className="mx-auto container max-h-full p-1 sm:p-6 space-y-8 overflow-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <User className="w-8 h-8 mr-3 text-primary-500" />
          My Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
        <UserInfoCard userProfile={userProfileData} />{" "}
        <ProfileTabs
          activityLogs={recentActivityLogs as ActivityLog[]}
          userProfileData={userProfileData}
        />
      </div>
    </div>
  );
}
