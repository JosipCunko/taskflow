"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  User,
  Calendar,
  Home,
  Inbox,
  ChartColumn,
  FileText,
  CalendarArrowUp,
  Heart,
} from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = {
    general: [
      {
        label: "Dashboard",
        href: "/webapp",
        icon: Home,
      },
      { label: "Inbox", icon: Inbox, href: "/webapp/inbox" },
    ],
    tasks: [
      {
        label: "Calendar",
        href: "/webapp/calendar",
        icon: CalendarArrowUp,
      },
      {
        label: "Tasks",
        href: "/webapp/tasks",
        icon: ChartColumn,
      },
      {
        label: "Completed",
        href: "/webapp/completed",
        icon: CheckSquare,
      },
      {
        label: "Notes",
        href: "/webapp/notes",
        icon: FileText,
      },
      {
        label: "Today",
        href: "/webapp/today",
        icon: Calendar,
      },
      {
        label: "Health",
        href: "/webapp/health",
        icon: Heart,
      },
    ],
    me: [
      {
        label: "Profile",
        href: "/webapp/profile",
        icon: User,
      },
    ],
  };

  return (
    <aside className="w-64 h-full bg-background-700 flex flex-col ">
      <div className="">
        <div className="grid place-items-center">
          <Image src="/logo.png" alt="Taskflow" width={150} height={150} />
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
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                          flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                            isActive
                              ? "bg-background-500 text-primary"
                              : "text-text-low hover:bg-background-500/40 hover:text-text-high"
                          } `}
                    >
                      <div className="relative">
                        {item?.label === "Today" && (
                          <span className="absolute top-[6.5px] left-[5px] text-[9px] font-bold">
                            {String(new Date().getDate()).padStart(2, "0")}
                          </span>
                        )}
                        <item.icon size={20} />
                      </div>
                      <span>{item.label}</span>
                    </Link>
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
