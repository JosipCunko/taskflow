import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  description: "You are offline. Prioritron will reload when your connection returns.",
  robots: { index: false, follow: false },
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
