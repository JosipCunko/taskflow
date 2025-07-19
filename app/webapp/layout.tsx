import type { Metadata } from "next";
import { authOptions } from "../_lib/auth";
import { getTasksByUserId } from "../_lib/tasks-admin";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Toaster } from "react-hot-toast";

import TopSidebar from "../_components/TopSidebar";
import AnimatedSidebar from "../_components/AnimatedSidebar";

export const metadata: Metadata = {
  title: "TaskFlow - WebApp",
  description: "Manage your tasks and boost your productivity with TaskFlow.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) redirect("/login");
  const userId = session.user.id;
  const tasks = await getTasksByUserId(userId);

  return (
    <>
      <main className="grid grid-rows-1 grid-cols-1 sm:grid-cols-[16rem_1fr] overflow-hidden relative h-screen bg-background-625">
        <AnimatedSidebar />
        <div className="overflow-hidden h-full grid grid-cols-1 grid-rows-[80px_1fr] px-2 sm:px-4 lg:px-6 relative">
          <TopSidebar session={session} tasks={tasks} />
          {children}
        </div>
      </main>
      <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
    </>
  );
}
