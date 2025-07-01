import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { redirect } from "next/navigation";
import {
  getNotificationsByUserIdAdmin,
  getNotificationStats,
} from "@/app/_lib/notifications-admin";
import InboxContent from "../../_components/inbox/InboxContent";
import { Inbox } from "lucide-react";

export default async function InboxPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const [notifications, stats] = await Promise.all([
    getNotificationsByUserIdAdmin(session.user.id, false),
    getNotificationStats(session.user.id),
  ]);

  return (
    <div className="p-1 sm:p-6 container max-h-full overflow-auto mx-auto">
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

      <InboxContent initialNotifications={notifications} initialStats={stats} />
    </div>
  );
}
