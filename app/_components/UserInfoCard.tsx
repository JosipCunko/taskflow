import { User, Calendar, FileText } from "lucide-react";
import Image from "next/image";
import { AppUser } from "../_types/types";
import StreakBar from "./StreakBar";
import { formatDate } from "../_utils/utils";
import LogoutButton from "./auth/LogoutButton";

export default function UserInfoCard({ user }: { user: AppUser }) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-background-surface rounded-lg p-6 border border-divider">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                width={60}
                height={60}
                className="rounded-full"
                alt={"User profile image"}
              />
            ) : (
              <User size={36} className="text-primary" />
            )}
          </div>
          <h2 className="text-xl font-bold">{user.displayName}</h2>
          <p className="text-text-low max-w-full truncate">{user.email}</p>

          <div className="mt-6 w-full space-y-4">
            <StreakBar points={user.rewardPoints} />
            <div className="flex items-center justify-between py-3 border-b border-divider">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-primary" />
                <span>Member Since</span>
              </div>
              <span className="font-semibold">
                {formatDate(user.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-divider">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-primary" />
                <span>Notes Created</span>
              </div>
              <span className="font-semibold">{user.notesCount}</span>
            </div>

            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
