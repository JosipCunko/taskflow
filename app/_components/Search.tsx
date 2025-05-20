"use client";

import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { navSearchItems } from "../utils";

export default function Search() {
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFocus = () => setIsActive(true);
  const handleBlur = () => {
    if (!searchQuery) {
      setIsActive(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchQuery("");
      setIsActive(false);
      e.currentTarget.blur();
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div
        className={`flex items-center gap-4 p-2 relative rounded-md ${
          isActive ? "bg-background-500" : "bg-transparent"
        }`}
      >
        <SearchIcon size={18} className="text-text-low" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search or type a command..."
          className="w-full bg-transparent border-none outline-none text-text-high placeholder:text-text-low"
        />
        {isActive && (
          <kbd className="absolute top-2 right-0 hidden sm:inline-flex px-2 py-1 bg-background-700 text-text-low text-xs rounded">
            Enter
          </kbd>
        )}
      </div>

      {isActive && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background-700 rounded-md shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-background-500">
            <h3 className="text-xs font-medium text-text-low">
              Recently viewed
            </h3>
            <ul className="mt-2 space-y-1">* Render recently viewed </ul>
          </div>

          <div className="p-3">
            <h3 className="text-xs font-medium text-text-low">Navigation</h3>
            <ul className="mt-2 space-y-1">
              {navSearchItems.map((item) => (
                <li key={item.label}>
                  <button className="flex items-center justify-between w-full p-2 hover:bg-background-500 rounded-md text-left">
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-text-low">
                        <item.icon />
                      </span>
                      <span>Go to {item.label}</span>
                    </div>
                    <span className="text-xs text-text-low">
                      <kbd className="px-1 py-0.5 bg-background-500 rounded">
                        {item.command[0]}
                      </kbd>
                      <span className="mx-1">then</span>
                      <kbd className="px-1 py-0.5 bg-background-500 rounded">
                        {item.command[1]}
                      </kbd>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
