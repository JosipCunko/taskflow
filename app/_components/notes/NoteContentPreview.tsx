"use client";

import DOMPurify from "dompurify";

interface NoteContentPreviewProps {
  content: string;
}

export default function NoteContentPreview({
  content,
}: NoteContentPreviewProps) {
  // Enhanced text rendering with basic formatting
  const renderContent = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Check for code blocks (lines starting with 4 spaces or tab)
      if (line.startsWith("    ") || line.startsWith("\t")) {
        return (
          <div
            key={index}
            className="bg-background-800 border-l-2 border-primary-500 px-3 py-1 my-1 font-mono text-sm text-primary-300"
          >
            {line.trim()}
          </div>
        );
      }

      // Check for headings (lines starting with # or ##)
      if (line.startsWith("# ")) {
        return (
          <h3 key={index} className="text-lg font-bold text-text-low mt-2 mb-1">
            {line.substring(2)}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h4
            key={index}
            className="text-base font-semibold text-text-low mt-2 mb-1"
          >
            {line.substring(3)}
          </h4>
        );
      }

      // Check for bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <div key={index} className="flex items-start gap-2 my-1">
            <span className="text-primary-400 mt-1">•</span>
            <span>{line.trim().substring(2)}</span>
          </div>
        );
      }

      // Check for numbered lists
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (numberedMatch) {
        return (
          <div key={index} className="flex items-start gap-2 my-1">
            <span className="text-primary-400 font-semibold min-w-[20px]">
              {numberedMatch[1]}.
            </span>
            <span>{numberedMatch[2]}</span>
          </div>
        );
      }

      // Check for mathematical expressions (surrounded by $)
      const mathMatch = line.match(/\$(.+?)\$/g);
      if (mathMatch) {
        let formattedLine = line;
        mathMatch.forEach((match) => {
          const expr = match.slice(1, -1);
          // Sanitize the expression to prevent XSS
          const sanitizedExpr = DOMPurify.sanitize(expr, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
          });
          formattedLine = formattedLine.replace(
            match,
            `<span class="text-purple-400 font-semibold bg-purple-500/10 px-1 rounded">${sanitizedExpr}</span>`
          );
        });
        // Sanitize the entire formatted line as an extra safety measure
        const sanitizedLine = DOMPurify.sanitize(formattedLine);
        return (
          <p
            key={index}
            className="my-1"
            dangerouslySetInnerHTML={{ __html: sanitizedLine }}
          />
        );
      }

      // Empty line
      if (line.trim() === "") {
        return <div key={index} className="h-2" />;
      }

      // Regular line
      return (
        <p key={index} className="my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="text-text-low text-sm whitespace-pre-wrap">
      {renderContent(content)}
    </div>
  );
}
