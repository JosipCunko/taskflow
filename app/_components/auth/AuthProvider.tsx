"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

type Props = {
  children?: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  // `session` prop is not needed here if you're fetching it within components
  // or relying on the SessionProvider to handle it.
  return <SessionProvider>{children}</SessionProvider>;
}
