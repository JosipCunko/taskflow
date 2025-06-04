import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../_lib/auth";
import { getTasksByUserId } from "../_lib/tasks";
import { Toaster } from "react-hot-toast";
import ClientWebappLayout from "@/app/_components/ClientWebappLayout";

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
  // Note: If session is null (user not authenticated), NextAuth middleware should ideally redirect.
  // Handling it here as well for robustness or if middleware isn't set up for all cases.
  // However, ClientWebappLayout will receive session as potentially null.

  const userId = session?.user?.id;
  // Fetch tasks only if userId is available. Pass empty array if not.
  const tasks = userId ? await getTasksByUserId(userId) : [];

  return (
    <>
      <ClientWebappLayout session={session} tasks={tasks}>
        {children}
      </ClientWebappLayout>
      <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
    </>
  );
}
