import { emojiOptions } from "../utils";
import Button from "./reusable/Button";

export default function EmojiExperience({
  currentExperience,
}: {
  currentExperience: "bad" | "okay" | "good" | "best" | undefined;
}) {
  return (
    <div className="max-w-fit rounded-lg shadow-lg px-1 -mb-5 ml-1 bg-primary-500/10 hover:bg-primary-500/20 ">
      <h2 className="text-sm font-semibold mb-0.5">Rate the task experience</h2>

      <div className="flex justify-center items-center gap-2 mb-8 w-full py-2.5 text-sm text-text-gray">
        {emojiOptions.map((option) => (
          <Button
            key={option.id}
            className={`flex flex-col items-center cursor-pointer group 
              ${
                currentExperience === option.id
                  ? "text-primary-500"
                  : "text-text-low"
              }`}
            variant="noStyle"
            type="submit"
            name="experience"
            value={option.id}
          >
            <div
              className={`text-4xl mb-2 transition-transform group-hover:scale-110 ${
                currentExperience === option.id
                  ? "ring-2 ring-primary-500"
                  : "ring-1 ring-background-500 hover:ring-primary-600"
              } rounded-full p-3`}
            >
              {<option.emoji />}
            </div>
            <span className="text-sm">{option.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
