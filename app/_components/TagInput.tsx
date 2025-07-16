"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { infoToast } from "../_utils/utils";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  id?: string;
}

function TagInput({ tags, setTags, id = "tag-input" }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    if (tags.length === 6) {
      infoToast("You can only add up to 6 tags");
      setTags(tags.filter((tag) => tag !== newTag));
    }
    setInputValue("");
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // Prevent form submission or adding a space character
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      <div className="max-w-sm flex flex-wrap items-center gap-2 p-2.5 rounded-lg focus-within:outline-none">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-background-500 text-primary-400 rounded-full text-sm transition-colors"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-primary-400 hover:text-accent focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={
            tags.length === 0 ? "Tags: (separate with spaces or Enter)" : ""
          }
          className="flex-1 bg-transparent text-text-high placeholder-text-gray focus-within:outline-none text-sm min-w-[100px] py-1"
        />
      </div>
    </div>
  );
}

export default TagInput;
