import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../_lib/auth";
import { getTasksByUserId } from "../_lib/tasks-admin";
import { Toaster } from "react-hot-toast";
import TopSidebar from "../_components/TopSidebar";
import { redirect } from "next/navigation";
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
      <main className="grid grid-rows-1 grid-cols-1 sm:grid-cols-[16rem_1fr] overflow-hidden h-screen relative bg-background-625">
        <AnimatedSidebar />
        <div className="overflow-hidden h-full grid-cols-1 grid-rows-[80px_1fr] p-2 sm:p-4 lg:p-6 relative">
          <TopSidebar session={session} tasks={tasks} />
          {children}
        </div>
      </main>
      <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
    </>
  );
}
