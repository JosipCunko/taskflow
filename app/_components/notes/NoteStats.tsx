"use client";

import { Clock, Type, FileText } from "lucide-react";

interface NoteStatsProps {
  content: string;
}

export default function NoteStats({ content }: NoteStatsProps) {
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split("\n").length : 0;
  
  // Average reading speed is ~200 words per minute
  const readingTimeMinutes = Math.ceil(wordCount / 200);
  const readingTime =
    readingTimeMinutes < 1 ? "< 1 min" : `${readingTimeMinutes} min`;

  return (
    <div className="flex flex-wrap gap-4 text-xs text-text-gray">
      <div className="flex items-center gap-1.5" title="Characters">
        <Type size={14} />
        <span>{charCount.toLocaleString()} chars</span>
      </div>
      <div className="flex items-center gap-1.5" title="Words">
        <FileText size={14} />
        <span>{wordCount.toLocaleString()} words</span>
      </div>
      <div className="flex items-center gap-1.5" title="Lines">
        <FileText size={14} />
        <span>{lineCount} lines</span>
      </div>
      <div className="flex items-center gap-1.5" title="Estimated reading time">
        <Clock size={14} />
        <span>{readingTime} read</span>
      </div>
    </div>
  );
}
