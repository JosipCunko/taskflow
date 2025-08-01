"use client";

import type { Dispatch, ForwardRefExoticComponent, RefAttributes } from "react";
import { TASK_ICONS } from "../_utils/icons";
import type { LucideProps } from "lucide-react";
import { Action } from "./AddTask";

export default function IconPicker({
  selectedIcon,
  dispatch,
}: {
  selectedIcon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  dispatch: Dispatch<Action>;
}) {
  return (
    <div className="flex flex-col gap-2 w-fit p-1">
      <label
        htmlFor="type"
        className="block text-sm font-medium text-text-low mb-1"
      >
        Task icon
      </label>
      <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 mb-4">
        {TASK_ICONS.map((icon) => (
          <button
            type="button"
            key={icon.id}
            onClick={() =>
              dispatch({ type: "selectedIcon", payload: icon.icon })
            }
            className={`w-8 h-8 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-transform hover:scale-110
              grid place-items-center
              ${
                selectedIcon === icon.icon
                  ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800"
                  : ""
              }`}
            aria-label={`Select icon ${icon}`}
          >
            <icon.icon />
          </button>
        ))}
      </div>
    </div>
  );
}
