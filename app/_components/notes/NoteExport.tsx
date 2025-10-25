"use client";

import { Download } from "lucide-react";
import { toast } from "react-hot-toast";

interface NoteExportProps {
  title: string;
  content: string;
}

export default function NoteExport({ title, content }: NoteExportProps) {
  const handleExport = (format: "txt" | "md") => {
    const fileName = `${title || "note"}.${format}`;
    const fileContent = format === "md" ? `# ${title}\n\n${content}` : content;
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Note exported as ${format.toUpperCase()}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Note content copied to clipboard!");
  };

  return (
    <div className="relative group">
      <button
        className="p-2 hover:bg-background-600 rounded-lg transition-colors text-text-gray hover:text-primary-400"
        title="Export note"
      >
        <Download size={16} />
      </button>
      <div className="absolute right-0 top-full mt-2 bg-background-700 border border-divider rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[160px]">
        <button
          onClick={() => handleExport("txt")}
          className="w-full text-left px-4 py-2 hover:bg-background-600 text-text-low text-sm transition-colors first:rounded-t-lg"
        >
          Export as TXT
        </button>
        <button
          onClick={() => handleExport("md")}
          className="w-full text-left px-4 py-2 hover:bg-background-600 text-text-low text-sm transition-colors"
        >
          Export as Markdown
        </button>
        <button
          onClick={handleCopy}
          className="w-full text-left px-4 py-2 hover:bg-background-600 text-text-low text-sm transition-colors last:rounded-b-lg border-t border-divider"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
