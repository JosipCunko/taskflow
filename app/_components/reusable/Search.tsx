"use client";

import { Search as SearchIcon, X } from "lucide-react";
import Input from "./Input";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filteredCount?: number;
  totalCount?: number;
  itemLabel?: string;
  hideInfo?: boolean;
  className?: string;
}

export default function Search({
  value,
  onChange,
  placeholder = "Search...",
  filteredCount,
  totalCount,
  itemLabel = "items",
  hideInfo = false,
  className = "",
}: SearchProps) {
  const handleClear = () => {
    onChange("");
  };

  const showInfo =
    !hideInfo &&
    value.trim() &&
    filteredCount !== undefined &&
    totalCount !== undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-gray pointer-events-none" />
        <Input
          name="search"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          className="pl-10 pr-10 flex-1"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-gray hover:text-primary-400 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showInfo && (
        <div className="flex items-center justify-between text-sm text-text-gray">
          <span>
            {filteredCount} of {totalCount} {itemLabel}
          </span>
        </div>
      )}
    </div>
  );
}
