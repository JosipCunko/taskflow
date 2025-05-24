import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import AuthProvider from "./_components/auth/AuthProvider";

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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased dark bg-background text-text-high transition-colors duration-200 `}
      >
        <AuthProvider>
          <div className="flex h-screen tracking-tight">
            <main className="flex-1 overflow-auto bg-background-625 flex flex-col">
              <div className="flex-1 overflow-auto relative">{children}</div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
