"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Search as SearchIcon,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { errorToast, navItemsToSearch } from "../_utils/utils";
import { getTaskIconByName } from "../_utils/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchUserTasks } from "../_lib/tasks";
import Loader from "./Loader";
import { SearchedTask, Task } from "../_types/types";

const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<T>) => ReturnType<T>;
};

interface SearchProps {
  onCloseModal?: () => void;
  tasks: Task[];
}

export default function Search({ onCloseModal, tasks }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchedTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const router = useRouter();
  const navListRef = useRef<HTMLUListElement>(null);

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const results = await searchUserTasks(query, tasks);
        setSearchResults(results);
      } catch (err) {
        //Avoid typescript whining
        const error = err as Error;
        errorToast(error.message);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [tasks]
  );

  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
      setIsLoading(false);
    }
    setHighlightedIndex(-1);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    if (highlightedIndex > -1 && navListRef.current) {
      const item = navListRef.current.children[
        highlightedIndex
      ] as HTMLLIElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchQuery("");
      if (onCloseModal) onCloseModal();
      return;
    }

    if (!searchQuery.trim() && searchResults.length === 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % navItemsToSearch.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex(
          (prev) =>
            (prev - 1 + navItemsToSearch.length) % navItemsToSearch.length
        );
      } else if (e.key === "Enter" && highlightedIndex > -1) {
        e.preventDefault();
        router.push(navItemsToSearch[highlightedIndex].link);
        if (onCloseModal) onCloseModal();
      }
    }
  };

  const handleItemClick = () => {
    if (onCloseModal) onCloseModal();
  };

  return (
    <div className="modal relative">
      <div
        className={`flex items-center gap-4 p-2 relative rounded-md 
           border-background-500 bg-background-700 border-1 `}
      >
        <SearchIcon size={18} className="text-text-low flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or type a command..."
          className="w-full bg-transparent border-none outline-none text-text-high placeholder:text-text-low"
          autoFocus
        />

        <kbd className="absolute top-2 right-0 hidden sm:inline-flex px-2 py-1 bg-background-700 text-text-low text-xs rounded">
          Enter
        </kbd>
      </div>

      <div className="overflow-y-auto ">
        {isLoading && (
          <div className="relative p-4 h-36 text-text-gray">
            <Loader label="Loading..." />
          </div>
        )}

        {!isLoading && searchQuery.trim() && searchResults.length === 0 && (
          <div className="p-6 text-center h-36">
            <MessageSquare size={40} className="mx-auto text-text-gray mb-3" />
            <p className="text-text-gray">
              No tasks found for &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs text-text-low mt-1">
              Try a different search term.
            </p>
          </div>
        )}

        {!isLoading && searchResults.length > 0 && (
          <div className="p-3">
            <h3 className="text-xs font-semibold text-text-low uppercase tracking-wider mb-2">
              Tasks
            </h3>
            <ul className="space-y-1">
              {searchResults.map((task) => {
                const Icon = getTaskIconByName(task.icon);

                return (
                  <li key={task.id}>
                    <Link
                      href={`/webapp/tasks`}
                      onClick={handleItemClick}
                      className={`flex items-center justify-between w-full p-2.5 hover:bg-background-500 rounded-md text-left group border-l-4`}
                      style={{
                        borderLeftColor: task.color,
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className="text-text-low group-hover:text-primary-400 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <span className="block text-sm text-text-high truncate group-hover:text-primary-400">
                            {task.title}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-text-low group-hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Navigation items always visible or when query is empty */}
        {!searchQuery.trim() && (
          <div className="p-3 mt-2">
            <h3 className="text-xs font-semibold text-text-low uppercase tracking-wider mb-2">
              Navigation
            </h3>
            <ul ref={navListRef} className="space-y-1">
              {navItemsToSearch.map((item, index) => (
                <li key={item.label}>
                  <Link
                    href={item.link}
                    onClick={handleItemClick}
                    className={`flex items-center justify-between w-full p-2.5 rounded-md text-left group ${
                      index === highlightedIndex
                        ? "bg-background-500"
                        : "hover:bg-background-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-text-low group-hover:text-primary-400">
                        <item.icon size={18} />
                      </span>
                      <span className="text-sm text-text-high group-hover:text-primary-400 text-nowrap">
                        Go to {item.label}
                      </span>
                    </div>
                    {item.command && item.command.length === 2 && (
                      <span className="text-xs text-text-low opacity-0 group-hover:opacity-100 transition-opacity">
                        <kbd className="px-1.5 py-0.5 bg-background-600 rounded">
                          {item.command[0]}
                        </kbd>
                        <span className="mx-0.5">→</span>
                        <kbd className="px-1.5 py-0.5 bg-background-600 rounded">
                          {item.command[1]}
                        </kbd>
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="p-3 absolute bottom-0 left-0 right-0 border-t border-background-500 text-center">
          <p className="text-xs text-text-gray">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-background-600 text-text-low rounded">
              ESC
            </kbd>{" "}
            to close. Use{" "}
            <kbd className="px-1.5 py-0.5 bg-background-600 text-text-low rounded">
              ↑
            </kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-background-600 text-text-low rounded">
              ↓
            </kbd>{" "}
            to navigate results.
          </p>
        </div>
      </div>
    </div>
  );
}
