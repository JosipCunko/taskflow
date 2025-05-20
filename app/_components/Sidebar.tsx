"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  User,
  Settings,
  CalendarArrowUp,
  Calendar,
  Search,
  Home,
  Inbox,
} from "lucide-react";
import Button from "./reusable/Button";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = {
    general: [
      {
        label: "Dashboard",
        href: "/",
        icon: Home,
      },
      { label: "Search", icon: Search, href: "" },
      { label: "Inbox", icon: Inbox, href: "/inbox" },
    ],
    tasks: [
      {
        label: "Calendar",
        href: "/calendar",
        icon: CalendarArrowUp,
      },
      {
        label: "Today",
        href: "/today",
        icon: Calendar,
      },
      {
        label: "Completed",
        href: "/completed",
        icon: CheckSquare,
      },
    ],
    me: [
      {
        label: "Profile",
        href: "/profile",
        icon: User,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  };

  return (
    <aside className="w-64 h-full bg-background-700 flex flex-col">
      <div className="p-4">
        <div className="grid place-items-center">
          <Image src="/logo.png" alt="Taskflow" width={200} height={10} />
        </div>
      </div>
      <nav className="p-2 flex-1 flex flex-col">
        {Object.entries(navItems).map(([groupName, items]) => (
          <div
            key={groupName}
            className={`mb-5 ${groupName === "me" ? "mt-auto" : ""}`}
          >
            <h2 className="px-4 mb-2 text-sm font-semibold uppercase text-text-low">
              {groupName}
            </h2>
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item?.href;
                return (
                  <li key={item.href}>
                    {item.label === "Search" ? (
                      <Button
                        variant="sidebar"
                        className={`gap-3 py-3 hover:bg-background-500/40
                          `}
                        onClick={() =>
                          console.log("SEARCH BUTTON NEEDS IMPLEMENTATION")
                        }
                      >
                        <item.icon size={20} />

                        <span>{item.label}</span>
                      </Button>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                          isActive
                            ? "bg-inherit text-primary"
                            : "text-text-low hover:bg-background-500/40 hover:text-text-high"
                        } `}
                      >
                        <div className="relative">
                          {item?.label === "Today" && (
                            <span className="absolute top-[6px] left-[5px] text-[9px] font-bold">
                              {new Date().getDate()}
                            </span>
                          )}
                          <item.icon size={20} />
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
