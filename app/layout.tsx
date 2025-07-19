import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./_components/auth/AuthProvider";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Task management web application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${plexMono.variable} font-mono antialiased dark bg-background-700 h-screen text-text-high transition-colors duration-200`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
