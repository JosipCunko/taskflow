"use client";

import { User, LogOut, Calendar, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Button from "./reusable/Button";
import { signOut } from "@/app/_lib/auth-client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/_lib/firebase";
import { userProfileType } from "../_types/types";
import StreakBar from "./StreakBar";

export default function UserInfoCard({
  userProfile,
}: {
  userProfile: userProfileType;
}) {
  const { data: session } = useSession();
  const [memberSince, setMemberSince] = useState(userProfile.memberSince);
  const [rewardPoints, setRewardPoints] = useState(userProfile.rewardPoints);

  useEffect(() => {
    if (!session?.user?.id) return;

    const userUnsubscribe = onSnapshot(
      doc(db, "users", session.user.id),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setMemberSince(data.createdAt?.toDate() || new Date());
          setRewardPoints(data.rewardPoints || 0);
        }
      },
      (error) => {
        console.error("Error fetching user data:", error);
      }
    );

    return () => {
      userUnsubscribe();
    };
  }, [session?.user?.id]);

  return (
    <div className="lg:col-span-1">
      <div className="bg-background-surface rounded-lg p-6 border border-divider">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            {session?.user.image ? (
              <Image
                src={session?.user.image}
                width={60}
                height={60}
                className="rounded-full"
                alt={"User profile image"}
              />
            ) : (
              <User size={36} className="text-primary" />
            )}
          </div>
          <h2 className="text-xl font-bold">{session?.user.name}</h2>
          <p className="text-text-low">{session?.user.email}</p>

          <div className="mt-6 w-full space-y-4">
            <StreakBar points={rewardPoints} />
            <div className="flex items-center justify-between py-3 border-b border-divider">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-primary" />
                <span>Member Since</span>
              </div>
              <span className="font-semibold">
                {memberSince?.toLocaleDateString() || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-divider">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-primary" />
                <span>Notes Created</span>
              </div>
              <span className="font-semibold">{userProfile.notesCount}</span>
            </div>

            <Button className="mt-6 mx-auto" variant="danger" onClick={signOut}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
