import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Sidebar from "../_components/Sidebar";
import TopSidebar from "../_components/TopSidebar";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getTasksByUserId } from "../_lib/tasks";

const geistSans = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Task management web application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  const tasks = await getTasksByUserId(userId);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased dark bg-background text-text-high transition-colors duration-200 `}
      >
        <div className="flex h-screen tracking-tight">
          <Sidebar tasks={tasks} />
          <main className="flex-1 overflow-auto bg-background-625 flex flex-col">
            <TopSidebar session={session} />

            <div className="flex-1 overflow-auto relative">{children}</div>
          </main>
        </div>
        <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
      </body>
    </html>
  );
}
