"use client";
import Loader from "@/app/_components/Loader";
import Button from "@/app/_components/reusable/Button";
import { signOut } from "@/app/_lib/auth";
import { User, Award, LogOut } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loader label="Loading the session..." />;

  return (
    <div className="p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <User className="w-8 h-8 mr-3 text-primary-500" />
          My profile
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
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

              <div className="mt-6 w-full">
                <div className="flex items-center justify-between py-3 border-b border-divider">
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-primary" />
                    <span>Reward Points</span>
                  </div>
                  <span className="font-semibold">
                    {session?.user.rewardPoints}
                  </span>
                </div>

                <Button
                  className="mt-6 mx-auto"
                  variant="danger"
                  onClick={signOut}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
