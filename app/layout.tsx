import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Sidebar from "./_components/Sidebar";
import TopSidebar from "./_components/TopSidebar";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./_components/auth/AuthProvider";
import { getServerSession } from "next-auth";

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
  const session = await getServerSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased dark bg-background text-text-high transition-colors duration-200 `}
      >
        <AuthProvider>
          <div className="flex h-screen tracking-tight">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-background-625 flex flex-col">
              <TopSidebar session={session} />

              <div className="flex-1 overflow-auto relative">{children}</div>
            </main>
          </div>
          <Toaster position="top-center" containerStyle={{ zIndex: 999999 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
