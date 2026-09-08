import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./_components/auth/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap", // Prevent invisible text during font loading
  preload: true, // Preload font for faster rendering
});

export const metadata: Metadata = {
  title: "Prioritron",
  description:
    "Modern task management web application with AI-powered features, analytics, and comprehensive productivity tools. Organize, prioritize, and achieve your goals with ultimate discipline and control.",
  keywords: [
    "task management",
    "productivity",
    "AI assistant",
    "goal tracking",
    "time management",
    "task planner",
  ],
  authors: [{ name: "Josip Čunko" }],
  creator: "Prioritron",
  manifest: "/manifest.json",
  metadataBase: new URL("https://opprioritron.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://opprioritron.vercel.app",
    title: "Prioritron - Master Your Productivity",
    description:
      "Modern task management with AI-powered features, analytics, and comprehensive productivity tools",
    siteName: "Prioritron",
    images: [
      {
        url: "/dashboard.png",
        width: 1200,
        height: 630,
        alt: "Prioritron Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prioritron - Master Your Productivity",
    description:
      "Modern task management with AI-powered features and comprehensive productivity tools",
    images: ["/dashboard.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prioritron",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/pwaicons/ios/180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0ea5e9",
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
        <SpeedInsights />
        <Analytics />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
