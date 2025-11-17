"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { ReactNode } from "react";

/**
 * LazyMotion wrapper that reduces framer-motion bundle size by ~75%
 * Only loads the dom animations needed, not the full library
 */
export default function LazyMotionProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
