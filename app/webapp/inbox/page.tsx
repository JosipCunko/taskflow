import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { redirect } from "next/navigation";
import {
  getNotificationsByUserId,
  getNotificationStats,
} from "@/app/_lib/notifications";
import InboxContent from "../../_components/inbox/InboxContent";
import { Inbox } from "lucide-react";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [notifications, stats] = await Promise.all([
    getNotificationsByUserId(session.user.id, false, 100),
    getNotificationStats(session.user.id),
  ]);

  return (
    <div className="p-5 mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400 flex items-center">
          <Inbox className="w-8 h-8 mr-3 text-primary-500" />
          Inbox
          {stats.totalUnread > 0 && (
            <span className="ml-3 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
              {stats.totalUnread} unread
            </span>
          )}
        </h1>
        <p className="text-text-low mt-2">
          Stay on top of your tasks with smart notifications and alerts.
        </p>
      </div>

      <Suspense fallback={<InboxSkeleton />}>
        <InboxContent
          initialNotifications={notifications}
          initialStats={stats}
        />
      </Suspense>
    </div>
  );
}

function InboxSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-background-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-background-600 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-background-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-background-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
