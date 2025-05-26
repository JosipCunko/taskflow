import ProfileTabs from "@/app/_components/ProfileTabs";
import { db } from "@/app/_lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User } from "lucide-react";
import { getServerSession } from "next-auth";
import { getTasksByUserId } from "@/app/_lib/tasks";
import UserInfoCard from "@/app/_components/UserInfoCard";
import { redirect } from "next/navigation";
import { getRecentUserActivity } from "@/app/_lib/activity";
import { calculateTaskPoints } from "@/app/utils";
import { ActivityLog, Task } from "@/app/_types/types";
import { authOptions } from "@/app/_lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [tasks, userDocSnap, recentActivityLogs] = await Promise.all([
    getTasksByUserId(userId),
    getDoc(doc(db, "users", userId)),
    getRecentUserActivity(userId, 7),
  ]);
  const userData = userDocSnap.exists() ? userDocSnap.data() : null;

  const totalPoints = (tasks as Task[]).reduce(
    (acc, task) => acc + calculateTaskPoints(task),
    0
  );
  const memberSince = userData?.createdAt?.toDate
    ? userData.createdAt.toDate()
    : undefined;

  const userProfileData = {
    displayName: userData?.displayName || session.user.name,
    email: userData?.email || session.user.email,
    photoURL: userData?.photoURL || session.user.image,
    rewardPoints: totalPoints,
    memberSince,
    // Add any other profile data needed by UserInfoCard or ProfileTabs
  };
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
          tasks={tasks as Task[]}
          userProfileData={userProfileData}
          activityLogs={recentActivityLogs as ActivityLog[]}
        />
      </div>
    </div>
  );
}
