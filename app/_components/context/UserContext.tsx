"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/_lib/firebase";

interface UserContextType {
  rewardPoints: number;
  memberSince: Date | null;
}

const UserContext = createContext<UserContextType>({
  rewardPoints: 0,
  memberSince: null,
});

export function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [rewardPoints, setRewardPoints] = useState(0);
  const [memberSince, setMemberSince] = useState<Date | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Subscribe to user document for real-time updates
    const unsubscribe = onSnapshot(
      doc(db, "users", session.user.id),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setRewardPoints(data.rewardPoints || 0);
          setMemberSince(data.createdAt?.toDate() || null);
        }
      },
      (error) => {
        console.error("Error fetching user data:", error);
      }
    );

    return () => unsubscribe();
  }, [session?.user?.id]);

  return (
    <UserContext.Provider value={{ rewardPoints, memberSince }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useReward must be used within a RewardProvider");
  }
  return context;
}
