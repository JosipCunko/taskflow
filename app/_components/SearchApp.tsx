"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronRight,
  MessageSquare,
  FileText,
  MessageCircle,
  UtensilsCrossed,
  LucideIcon,
} from "lucide-react";
import { errorToast, navItemsToSearch } from "../_utils/utils";
import { getTaskIconByName } from "../_utils/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchUserTasks } from "../_lib/tasks";
import { getChats } from "../_lib/aiActions";
import Loader from "./Loader";
import { SearchedTask, Task, Note, SavedMeal } from "../_types/types";
import Search from "./reusable/Search";

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

interface SearchResults {
  tasks: SearchedTask[];
  notes: Note[];
  chats: { id: string; title: string }[];
  savedMeals: SavedMeal[];
}

export default function SearchApp({ onCloseModal, tasks }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults>({
    tasks: [],
    notes: [],
    chats: [],
    savedMeals: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const router = useRouter();
  const navListRef = useRef<HTMLUListElement>(null);

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults({
          tasks: [],
          notes: [],
          chats: [],
          savedMeals: [],
        });
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const lowerCaseQuery = query.toLowerCase();

        // Search tasks
        const taskResults = await searchUserTasks(query, tasks);

        // Search notes
        let noteResults: Note[] = [];
        try {
          const notesResponse = await fetch("/api/notes");
          if (notesResponse.ok) {
            const notesData = await notesResponse.json();
            const allNotes = notesData.data || [];
            noteResults = allNotes.filter(
              (note: Note) =>
                note.title.toLowerCase().includes(lowerCaseQuery) ||
                note.content.toLowerCase().includes(lowerCaseQuery)
            );
          }
        } catch (err) {
          console.error("Error fetching notes:", err);
        }

        // Search AI chats
        let chatResults: { id: string; title: string }[] = [];
        try {
          const chatsResult = await getChats();
          if (chatsResult.chats) {
            chatResults = chatsResult.chats.filter((chat) =>
              chat.title.toLowerCase().includes(lowerCaseQuery)
            );
          }
        } catch (err) {
          console.error("Error fetching chats:", err);
        }

        // Search saved meals
        let savedMealResults: SavedMeal[] = [];
        try {
          const mealsResponse = await fetch("/api/health/savedMeals");
          if (mealsResponse.ok) {
            const mealsData = await mealsResponse.json();
            const allMeals = mealsData.data || [];
            savedMealResults = allMeals.filter(
              (meal: SavedMeal) =>
                meal.name.toLowerCase().includes(lowerCaseQuery) ||
                meal.description?.toLowerCase().includes(lowerCaseQuery) ||
                meal.producer?.toLowerCase().includes(lowerCaseQuery) ||
                meal.ingredients.some((ing) =>
                  ing.toLowerCase().includes(lowerCaseQuery)
                )
            );
          }
        } catch (err) {
          console.error("Error fetching saved meals:", err);
        }

        setSearchResults({
          tasks: taskResults,
          notes: noteResults,
          chats: chatResults,
          savedMeals: savedMealResults,
        });
      } catch (err) {
        const error = err as Error;
        errorToast(error.message);
        setSearchResults({
          tasks: [],
          notes: [],
          chats: [],
          savedMeals: [],
        });
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
      setSearchResults({
        tasks: [],
        notes: [],
        chats: [],
        savedMeals: [],
      });
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchQuery("");
        if (onCloseModal) onCloseModal();
        return;
      }

      const totalResults =
        searchResults.tasks.length +
        searchResults.notes.length +
        searchResults.chats.length +
        searchResults.savedMeals.length;

      if (!searchQuery.trim() && totalResults === 0) {
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

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery, searchResults, highlightedIndex, router, onCloseModal]);

  const handleItemClick = () => {
    if (onCloseModal) onCloseModal();
  };

  const totalResults =
    searchResults.tasks.length +
    searchResults.notes.length +
    searchResults.chats.length +
    searchResults.savedMeals.length;

  return (
    <div className="modal-bigger relative">
      <Search
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search or type a command..."
        hideInfo
      />

      <div className="overflow-y-auto ">
        {isLoading && (
          <div className="relative p-4 h-36 text-text-gray">
            <Loader label="Loading..." />
          </div>
        )}

        {!isLoading && searchQuery.trim() && totalResults === 0 && (
          <div className="p-6 text-center h-36">
            <MessageSquare size={40} className="mx-auto text-text-gray mb-3" />
            <p className="text-text-gray">
              No results found for &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs text-text-low mt-1">
              Try a different search term.
            </p>
          </div>
        )}

        {!isLoading && totalResults > 0 && (
          <div className="p-3 space-y-4">
            {/* Tasks */}
            {searchResults.tasks.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-low uppercase tracking-wider mb-2">
                  Tasks
                </h3>
                <ul className="space-y-1">
                  {searchResults.tasks.map((task) => {
                    const Icon = getTaskIconByName(task.icon);

                    return (
                      <SearchItem
                        key={task.id}
                        iconObj={{ icon: Icon }}
                        handleItemClick={handleItemClick}
                        color={task.color}
                        href="/webapp/tasks"
                        label={task.title}
                      />
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Notes */}
            {searchResults.notes.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-low uppercase tracking-wider mb-2">
                  Notes
                </h3>
                <ul className="space-y-1">
                  {searchResults.notes.map((note) => (
                    <SearchItem
                      key={note.id}
                      iconObj={{ icon: FileText }}
                      handleItemClick={handleItemClick}
                      color="#ffd600"
                      href="/webapp/notes"
                      label={note.title || "Untitled Note"}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* AI Chats */}
            {searchResults.chats.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-low uppercase tracking-wider mb-2">
                  AI Chats
                </h3>
                <ul className="space-y-1">
                  {searchResults.chats.map((chat) => (
                    <SearchItem
                      key={chat.id}
                      iconObj={{ icon: MessageCircle }}
                      handleItemClick={handleItemClick}
                      color="#ff7a26"
                      href={`/webapp/ai/${chat.id}`}
                      label={chat.title}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Saved Meals */}
            {searchResults.savedMeals.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-low uppercase tracking-wider mb-2">
                  Saved Meals
                </h3>
                <ul className="space-y-1">
                  {searchResults.savedMeals.map((meal) => (
                    <SearchItem
                      key={meal.id}
                      iconObj={{ icon: UtensilsCrossed }}
                      handleItemClick={handleItemClick}
                      color="#cf6679"
                      href="/webapp/health"
                      label={meal.name}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Navigation items always visible or when query is empty */}
        {!searchQuery.trim() && totalResults === 0 && (
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

function SearchItem({
  iconObj,
  color,
  href,
  handleItemClick,
  label,
}: {
  iconObj: { icon: LucideIcon };
  color: string;
  href: string;
  handleItemClick: () => void;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={handleItemClick}
        className={`flex items-center justify-between w-full p-2.5 hover:bg-background-500 rounded-md text-left group border-l-4`}
        style={{
          borderLeftColor: color,
          transition: "border-color 0.2s",
        }}
      >
        <div className="flex items-center gap-3">
          <iconObj.icon
            size={18}
            className="text-text-low group-hover:text-primary-400 shrink-0"
          />
          <div className="overflow-hidden">
            <span className="block text-sm text-text-high truncate group-hover:text-primary-400">
              {label}
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
}
