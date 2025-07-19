import { User } from "lucide-react";

export default function ProfileSkeleton() {
  return (
    <div className="mx-auto container max-h-full p-1 sm:p-6 space-y-8 overflow-auto animate-pulse">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <User className="w-8 h-8 mr-3 text-primary-500 icon-glow" />
          <span className="text-glow">My Profile</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
        {/* UserInfoCard Skeleton - Left Column */}
        <div className="lg:col-span-1">
          <div className="bg-background-surface rounded-lg p-6 border border-divider">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-background-500 mb-4" />

              <div className="h-6 w-32 bg-background-500 rounded mb-2" />
              <div className="h-4 w-40 bg-background-500 rounded" />

              <div className="mt-6 w-full">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="h-4 w-24 bg-background-500 rounded" />
                    <div className="h-4 w-16 bg-background-500 rounded" />
                  </div>
                  <div className="w-full h-3 bg-background-600 rounded-full">
                    <div className="bg-background-500 h-3 rounded-full w-1/3" />
                  </div>
                  <div className="h-3 w-48 bg-background-500 rounded" />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-divider">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-background-500 rounded" />
                      <div className="h-4 w-24 bg-background-500 rounded" />
                    </div>
                    <div className="h-4 w-20 bg-background-500 rounded" />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-divider">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-background-500 rounded" />
                      <div className="h-4 w-24 bg-background-500 rounded" />
                    </div>
                    <div className="h-4 w-8 bg-background-500 rounded" />
                  </div>

                  <div className="h-10 w-24 bg-background-500 rounded mt-6 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ProfileTabs Skeleton - Right Columns */}
        <div className="lg:col-span-2">
          <div className="flex space-x-4 border-b border-divider">
            <div className="pb-4 px-2 flex items-center gap-2">
              <div className="w-5 h-5 bg-background-500 rounded" />
              <div className="h-4 w-16 bg-background-500 rounded" />
            </div>
            <div className="pb-4 px-2 flex items-center gap-2">
              <div className="w-5 h-5 bg-background-500 rounded" />
              <div className="h-4 w-16 bg-background-500 rounded" />
            </div>
          </div>

          <div className="space-y-6 mt-6">
            <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
              <div className="h-6 w-32 bg-background-500 rounded mb-4" />

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="py-2.5 border-b border-divider last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-8 h-8 rounded-full bg-background-500" />
                        <div className="flex-grow">
                          <div className="h-4 w-24 bg-background-500 rounded mb-1.5" />
                          <div className="h-3 w-32 bg-background-500 rounded" />
                        </div>
                      </div>
                      <div className="h-3 w-16 bg-background-500 rounded ml-2 pt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
