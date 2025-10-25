"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { Tooltip } from "react-tooltip";

interface NotesSearchProps {
  onSearchChange: (query: string) => void;
}

export default function NotesSearch({ onSearchChange }: NotesSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearchChange("");
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-gray"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search notes by title or content..."
          className="w-full pl-10 pr-10 py-2.5 bg-background-700 border border-divider rounded-lg shadow-sm placeholder-text-gray focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-text-low transition-all"
        />
        {searchQuery && (
          <>
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-gray hover:text-primary-400 transition-colors"
              aria-label="Clear search"
              data-tooltip-id="clear-search-tooltip"
              data-tooltip-content="Clear search"
            >
              <X size={18} />
            </button>
            <Tooltip id="clear-search-tooltip" place="top" />
          </>
        )}
      </div>
      {searchQuery && (
        <p className="text-xs text-text-gray mt-2 ml-1">
          Searching for: <span className="text-primary-400">{searchQuery}</span>
        </p>
      )}
    </div>
  );
}
