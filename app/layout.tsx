import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import AuthProvider from "./_components/auth/AuthProvider";

const geistSans = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});
/*
const geistSans = Montserrat({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});*/

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
        className={`${geistSans.variable} antialiased dark bg-background text-text-high transition-colors duration-200 `}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
