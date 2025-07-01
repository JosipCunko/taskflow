"use client";

import { User, Search as SearchIcon } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import { getPhaseOfTheDay } from "../_utils/utils";
import { useState, useEffect } from "react";

import { Plus } from "lucide-react";
import Modal from "./Modal";
import Button from "./reusable/Button";
import AddTask from "./AddTask";
import { useKeyboardNavigation } from "../_hooks/useKeyboardNavigation";
import { Task } from "../_types/types";
import Search from "./Search";
import NotificationBell from "./inbox/NotificationBell";

export default function TopSidebar({
  session,
  tasks,
}: {
  session: Session | null;
  tasks: Task[];
}) {
  //Beacuse it is a CC - must be for react-tooltip
  useKeyboardNavigation();
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    // Update to the next minute boundary
    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let timer: NodeJS.Timeout;

    const initialTimeout = setTimeout(() => {
      setCurrentTime(new Date());

      // Then update every minute
      timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(initialTimeout);
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <header className="flex items-center justify-between p-4 border-b border-background-500 h-[80px]">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-semibold sm:block hidden text-text-low">
            Good {getPhaseOfTheDay()}, {session?.user.name}
          </h1>
          <div className="text-sm text-text-gray sm:block hidden">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            •{" "}
            {currentTime.toLocaleDateString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 tooltip-container">
        <Modal>
          <Modal.Open opens="search">
            <Button
              variant="secondary"
              className={`gap-3 py-3 hover:bg-background-500/40 text-text-low font-medium hover:text-text-high`}
            >
              <SearchIcon size={16} className="text-text-low" />

              <span className="hidden sm:block">Search</span>
            </Button>
          </Modal.Open>
          <Modal.Window name="search" showButton>
            <Search tasks={tasks} />
          </Modal.Window>
        </Modal>

        <Modal>
          <Modal.Open opens="add-task">
            <Button className="text-nowrap">
              <Plus size={18} />
              <span>New Task</span>
            </Button>
          </Modal.Open>

          <Modal.Window name="add-task">
            <AddTask />
          </Modal.Window>
        </Modal>

        <NotificationBell />

        <Link href="/webapp/profile">
          {session?.user.image ? (
            <Image
              src={session?.user.image}
              width={40}
              height={40}
              className="rounded-full"
              alt={"User profile image"}
              data-tooltip-id="profile-link"
              data-tooltip-content="Your profile"
            />
          ) : (
            <User
              size={20}
              className="text-primary"
              data-tooltip-id="profile-link"
              data-tooltip-content="Your profile"
            />
          )}
        </Link>
        <Tooltip
          id="profile-link"
          className="tooltip-diff-arrow"
          classNameArrow="tooltip-arrow"
        />
      </div>
    </header>
  );
}
