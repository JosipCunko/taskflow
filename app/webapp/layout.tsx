import type { Metadata } from "next";
import { authOptions } from "../_lib/auth";
import { getTasksByUserId } from "../_lib/tasks-admin";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import TopSidebar from "../_components/TopSidebar";
import AnimatedSidebar from "../_components/AnimatedSidebar";
import dynamicImport from "next/dynamic";
import { getUserById } from "../_lib/user-admin";
import Providers from "./providers";
import PWAInstall from "../_components/PWAInstall";
import OfflineIndicator from "../_components/OfflineIndicator";
import RefreshOnFocus from "../_components/RefreshOnFocus";
import TaskStoreHydrator from "../_components/offline/TaskStoreHydrator";
import OfflineShell from "../_components/offline/OfflineShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "App",
  robots: { index: false, follow: false },
};

const AnalyticsTracker = dynamicImport(
  () => import("../_components/AnalyticsTracker"),
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) redirect("/login");
  const userId = session.user.id;
  const tasks = await getTasksByUserId(userId);
  const userData = await getUserById(userId);

  if (!userData) redirect("/login");

  return (
    <Providers>
      <PWAInstall
        receiveUpdateNotifications={userData.receiveUpdateNotifications ?? true}
      />
      <OfflineIndicator />
      <RefreshOnFocus />
      <AnalyticsTracker userData={userData} />
      <TaskStoreHydrator userId={userId} tasks={tasks} />
      <main className="grid grid-rows-1 grid-cols-1 sm:grid-cols-[16rem_1fr] relative h-screen bg-background-625">
        <AnimatedSidebar />
        <div className="h-screen flex flex-col px-2 sm:px-4 lg:px-6 relative overflow-hidden">
          <TopSidebar session={session} tasks={tasks} />
          <div className="overflow-y-auto overflow-x-hidden h-full">
            <OfflineShell>{children}</OfflineShell>
          </div>
        </div>
      </main>
    </Providers>
  );
}
