"use client";

import { colorsColorPicker } from "../_utils/utils";
import type { Dispatch } from "react";
import type { Action } from "./AddTask";

export default function ColorPicker({
  selectedColor,
  dispatch,
}: {
  selectedColor: string;
  dispatch: Dispatch<Action>;
}) {
  return (
    <div className="flex flex-col gap-2 w-fit p-1">
      <label
        htmlFor="type"
        className="block text-sm font-medium text-text-low mb-1"
      >
        Task color
      </label>
      <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 mb-4">
        {colorsColorPicker.map((color) => (
          <button
            type="button"
            key={color}
            onClick={() => dispatch({ type: "selectedColor", payload: color })}
            className={`w-8 h-8 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-transform hover:scale-110 ${
              selectedColor === color
                ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800"
                : ""
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
