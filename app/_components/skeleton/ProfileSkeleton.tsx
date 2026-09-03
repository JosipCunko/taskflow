import { CreditCard, Mail, Settings, Trophy, User } from "lucide-react";
import TaskCardSmallSkeleton from "./TaskCardSmallSkeleton";
import Bone from "./Bone";

export default function ProfileSkeleton() {
  return (
    <div className="mx-auto container p-1 sm:p-6 pb-8 space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <User className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">My Profile</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-background-surface rounded-lg p-6 border border-divider">
            <div className="flex flex-col items-center">
              <Bone className="w-24 h-24 rounded-full mb-4" />
              <Bone className="h-6 w-32 rounded mb-2" />
              <Bone className="h-4 w-40 rounded" />

              <div className="mt-6 w-full space-y-4">
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Reward Points</span>
                    <Bone className="h-4 w-16 rounded" />
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <Bone className="h-full w-1/3 rounded-full" />
                  </div>
                  <Bone className="h-3 w-48 rounded" />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-divider">
                  <div className="flex items-center gap-3">
                    <Bone className="w-5 h-5 rounded" />
                    <span>Member Since</span>
                  </div>
                  <Bone className="h-4 w-24 rounded" />
                </div>

                <Bone className="h-10 w-full rounded mt-2" />
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 sm:p-6 border-2 border-divider flex items-center gap-3">
            <Mail />
            <div>
              <h3 className="text-lg font-bold text-primary drop-shadow">
                Contact Us
              </h3>
              <span className="block text-xs whitespace-nowrap text-text-low">
                Questions? We&apos;re here to help.
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-background-600 mb-4">
            <div className="relative flex-1 py-3 text-center font-semibold text-white">
              <div className="flex items-center justify-center gap-2">
                <Trophy size={16} className="hidden sm:block" />
                Overview
              </div>
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary-500" />
            </div>
            <div className="relative flex-1 py-3 text-center font-semibold text-text-low">
              <div className="flex items-center justify-center gap-2">
                <Settings size={16} className="hidden sm:block" />
                Settings
              </div>
            </div>
            <div className="relative flex-1 py-3 text-center font-semibold text-text-low">
              <div className="flex items-center justify-center gap-2">
                <CreditCard size={16} className="hidden sm:block" />
                Subscription
              </div>
            </div>
          </div>

          <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-text-high">
              Recent Activity
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="py-2.5 border-b border-divider last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 w-full min-w-0">
                      <Bone className="mt-1 w-8 h-8 rounded-full shrink-0" />
                      <div className="grow min-w-0">
                        <Bone className="h-4 w-28 rounded mb-1.5" />
                        <TaskCardSmallSkeleton />
                      </div>
                    </div>
                    <Bone className="h-3 w-16 rounded shrink-0 ml-2 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
