import ProfileTabs from "@/app/_components/ProfileTabs";
import { db } from "@/app/_lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User } from "lucide-react";
import { getServerSession } from "next-auth";
import UserInfoCard from "@/app/_components/UserInfoCard";
import { redirect } from "next/navigation";
import { getRecentUserActivity } from "@/app/_lib/activity";
import { ActivityLog } from "@/app/_types/types";
import { authOptions } from "@/app/_lib/auth";
import { loadNotesByUserId } from "@/app/_lib/notes";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [userDocSnap, recentActivityLogs, notes] = await Promise.all([
    getDoc(doc(db, "users", userId)),
    getRecentUserActivity(userId, 7),
    loadNotesByUserId(userId),
  ]);
  const userData = userDocSnap.exists() ? userDocSnap.data() : null;

  const memberSince = userData?.createdAt?.toDate
    ? userData.createdAt.toDate()
    : undefined;

  const userProfileData = {
    displayName: userData?.displayName || session.user.name,
    email: userData?.email || session.user.email,
    photoURL: userData?.photoURL || session.user.image,
    rewardPoints: userData?.rewardPoints || 0,
    memberSince,
    id: userId,
    notifyReminders: userData?.notifyReminders ?? true,
    notifyAchievements: userData?.notifyAchievements ?? true,
    notesCount: notes.length,
  };
  console.log(userProfileData);
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <User className="w-8 h-8 mr-3 text-primary-500" />
          My Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <UserInfoCard userProfile={userProfileData} />{" "}
        <ProfileTabs
          activityLogs={recentActivityLogs as ActivityLog[]}
          userProfileData={userProfileData}
        />
      </div>
    </div>
  );
}
