"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { navItems } from "../_utils/utils";

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 h-full bg-background-700 flex flex-col ">
      <div className="">
        <div className="grid place-items-center">
          <Image src="/logo.png" alt="Taskflow" width={150} height={150} />
        </div>
      </div>
      <nav className="p-2 flex-1 flex flex-col overflow-y-auto">
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
                const getTutorialAttribute = () => {
                  switch (item.label) {
                    case "Tasks":
                      return "sidebar-tasks";
                    case "Health":
                      return "sidebar-health";
                    case "Calendar":
                      return "sidebar-calendar";
                    case "Gym":
                      return "sidebar-gym";
                    default:
                      break;
                  }
                };

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-tutorial={getTutorialAttribute()}
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
                      {item?.badge && (
                        <span
                          className="ml-auto font-bold  text-text-low  rounded-md text-[0.8rem] px-1 py-0.5"
                          style={{ backgroundColor: item.badge.color }}
                        >
                          {item.badge.label}
                        </span>
                      )}
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
