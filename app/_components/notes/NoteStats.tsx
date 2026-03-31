"use client";

import { Type, FileText } from "lucide-react";
import { Tooltip } from "react-tooltip";

interface NoteStatsProps {
  content: string;
}

export default function NoteStats({ content }: NoteStatsProps) {
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split("\n").length : 0;

  return (
    <div className="flex flex-wrap gap-4 text-xs text-text-gray">
      <div
        className="flex items-center gap-1.5"
        data-tooltip-id="note-stats-chars"
        data-tooltip-content="Characters"
      >
        <Type size={14} />
        <span>{charCount.toLocaleString()} chars</span>
      </div>
      <div
        className="flex items-center gap-1.5"
        data-tooltip-id="note-stats-words"
        data-tooltip-content="Words"
      >
        <FileText size={14} />
        <span>{wordCount.toLocaleString()} words</span>
      </div>
      <div
        className="flex items-center gap-1.5"
        data-tooltip-id="note-stats-lines"
        data-tooltip-content="Lines"
      >
        <FileText size={14} />
        <span>{lineCount} lines</span>
      </div>
      <Tooltip id="note-stats-chars" place="top" />
      <Tooltip id="note-stats-words" place="top" />
      <Tooltip id="note-stats-lines" place="top" />
    </div>
  );
}
