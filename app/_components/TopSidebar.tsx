"use client";

import { BellIcon } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "react-tooltip";
import { getPhaseOfTheDay } from "../utils";

import { Plus } from "lucide-react";
import Modal from "./Modal";
import Button from "./reusable/Button";
import AddTask from "./AddTask";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
export default function TopSidebar({ session }: { session: Session | null }) {
  //Beacuse it is a CC - must be for react-tooltip
  useKeyboardNavigation();
  return (
    <header className="flex items-center justify-between p-4 border-b border-background-500">
      <div>
        <h1 className="text-xl font-semibold">
          Good {getPhaseOfTheDay()}, {session?.user.name}
        </h1>
      </div>

      <div className="flex items-center gap-4 tooltip-container">
        <Modal>
          <Modal.Open opens="add-task">
            <Button>
              <Plus size={18} />
              <span>New Task</span>
            </Button>
          </Modal.Open>

          <Modal.Window name="add-task">
            <AddTask />
          </Modal.Window>
        </Modal>

        <>
          <div
            className="p-1.5 rounded-full hover:bg-background-500 transition-colors relative"
            data-tooltip-id="notifications"
            data-tooltip-content="Your notifications"
          >
            <BellIcon size={20} />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
          <Tooltip
            id="notifications"
            place="left"
            className="tooltip-diff-arrow"
            classNameArrow="tooltip-arrow"
          />
        </>

        <Link href="/webapp/profile">
          <Image
            src={session?.user.image || "/will-not-work.png"}
            width={40}
            height={40}
            className="rounded-full"
            alt={"User"}
            data-tooltip-id="profile-link"
            data-tooltip-content="Your profile"
          />
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
