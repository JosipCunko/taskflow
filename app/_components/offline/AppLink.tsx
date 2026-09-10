"use client";

import Link, { type LinkProps } from "next/link";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useOnlineStatus } from "@/app/_hooks/useOnlineStatus";
import { navigateOffline } from "@/app/_lib/offlineNavigation";

type AppLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  "data-tutorial"?: string;
};

function hrefToPath(href: LinkProps["href"]) {
  if (typeof href === "string") return href;
  const pathname = href.pathname ?? "";
  const search = href.search ?? "";
  const hash = href.hash ?? "";
  return `${pathname}${search}${hash}`;
}

/**
 * Next.js Link that stays inside the live document while offline, so the
 * App Router never tries (and fails) to fetch the next page's RSC payload.
 */
export default function AppLink({
  href,
  onClick,
  children,
  ...rest
}: AppLinkProps) {
  const isOnline = useOnlineStatus();
  const path = hrefToPath(href);

  return (
    <Link
      href={href}
      onClick={(event) => {
        if (!isOnline && path.startsWith("/webapp")) {
          event.preventDefault();
          navigateOffline(path);
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
