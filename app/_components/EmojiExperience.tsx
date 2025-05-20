"use client";

import { useState } from "react";
import Button from "./reusable/Button";

type EmojiOption = {
  id: string;
  emoji: string;
  label: string;
  selected?: boolean;
};

export default function EmojiExperience() {
  const [emojiOptions, setEmojiOptions] = useState<EmojiOption[]>([
    { id: "bad", emoji: "😕", label: "Bad", selected: false },
    { id: "okay", emoji: "😐", label: "Okay", selected: false },
    { id: "good", emoji: "😄", label: "Good", selected: false },
  ]);

  const handleEmojiSelect = (id: string) => {
    setEmojiOptions(
      emojiOptions.map((option) => ({
        ...option,
        selected: option.id === id,
      }))
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-background-700 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">
        How was the task experience for you?
      </h2>

      <div className="flex justify-center gap-6 mt-6 mb-8 ">
        {emojiOptions.map((option) => (
          <Button
            key={option.id}
            onClick={() => handleEmojiSelect(option.id)}
            className={`flex flex-col items-center cursor-pointer group ${
              option.selected ? "text-primary" : "text-text-low"
            }`}
            variant="noStyle"
          >
            <div
              className={`text-4xl mb-2 transition-transform group-hover:scale-110 ${
                option.selected
                  ? "ring-2 ring-primary-500"
                  : "ring-1 ring-background-500 hover:ring-background-400"
              } rounded-full p-3`}
            >
              {option.emoji}
            </div>
            <span className="text-sm">{option.label}</span>
          </Button>
        ))}
      </div>

      {emojiOptions.some((option) => option.selected) && (
        <div className="text-center mt-4 flex justify-center">
          <Button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
            variant="primary"
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}
