import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Prioritron, the all-in-one productivity platform for tasks, fitness, nutrition, and AI coaching. Create an account with email, Google, or GitHub.",
  alternates: { canonical: "/login" },
  robots: { index: true, follow: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
