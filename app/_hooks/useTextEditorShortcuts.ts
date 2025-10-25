"use client";

import { useCallback } from "react";

interface UseTextEditorShortcutsProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onSave?: () => void;
}

export function useTextEditorShortcuts({
  textareaRef,
  onSave,
}: UseTextEditorShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S: Save
      if (ctrlKey && e.key === "s") {
        e.preventDefault();
        onSave?.();
        return;
      }

      // Escape: Save and stop editing
      if (e.key === "Escape") {
        e.preventDefault();
        onSave?.();
        return;
      }

      // Ctrl/Cmd + D: Duplicate line
      if (ctrlKey && e.key === "d") {
        e.preventDefault();
        const { selectionStart, value } = textarea;
        const lines = value.split("\n");
        let currentLineEnd = 0;
        let currentLineIndex = 0;

        // Find which line the cursor is on
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length + 1; // +1 for \n
          if (charCount + lineLength > selectionStart) {
            currentLineEnd = charCount + lines[i].length;
            currentLineIndex = i;
            break;
          }
          charCount += lineLength;
        }

        // Duplicate the line
        const lineToDuplicate = lines[currentLineIndex];
        const newValue =
          value.substring(0, currentLineEnd) +
          "\n" +
          lineToDuplicate +
          value.substring(currentLineEnd);

        textarea.value = newValue;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));

        // Move cursor to duplicated line
        const newCursorPos = currentLineEnd + lineToDuplicate.length + 1;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        return;
      }

      // Ctrl/Cmd + X (when nothing is selected): Delete line
      const { selectionStart, selectionEnd, value } = textarea;
      if (ctrlKey && e.key === "x" && selectionStart === selectionEnd) {
        e.preventDefault();
        const lines = value.split("\n");
        let currentLineStart = 0;
        let currentLineIndex = 0;

        // Find which line the cursor is on
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length + 1;
          if (charCount + lineLength > selectionStart) {
            currentLineStart = charCount;
            currentLineIndex = i;
            break;
          }
          charCount += lineLength;
        }

        // Delete the line
        lines.splice(currentLineIndex, 1);
        const newValue = lines.join("\n");

        textarea.value = newValue;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));

        // Set cursor position
        const newCursorPos = Math.min(currentLineStart, newValue.length);
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        return;
      }

      // Ctrl/Cmd + K: Delete line
      if (ctrlKey && e.key === "k") {
        e.preventDefault();
        const { selectionStart, value } = textarea;
        const lines = value.split("\n");
        let currentLineStart = 0;
        let currentLineIndex = 0;

        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length + 1;
          if (charCount + lineLength > selectionStart) {
            currentLineStart = charCount;
            currentLineIndex = i;
            break;
          }
          charCount += lineLength;
        }

        lines.splice(currentLineIndex, 1);
        const newValue = lines.join("\n");

        textarea.value = newValue;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));

        const newCursorPos = Math.min(currentLineStart, newValue.length);
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        return;
      }

      // Alt + Up: Move line up
      if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault();
        const { selectionStart, value } = textarea;
        const lines = value.split("\n");
        let currentLineIndex = 0;

        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length + 1;
          if (charCount + lineLength > selectionStart) {
            currentLineIndex = i;
            break;
          }
          charCount += lineLength;
        }

        if (currentLineIndex > 0) {
          // Swap with previous line
          [lines[currentLineIndex - 1], lines[currentLineIndex]] = [
            lines[currentLineIndex],
            lines[currentLineIndex - 1],
          ];
          const newValue = lines.join("\n");

          textarea.value = newValue;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));

          // Move cursor with the line
          const newLineStart = lines
            .slice(0, currentLineIndex - 1)
            .reduce((sum, line) => sum + line.length + 1, 0);
          const offsetInLine = selectionStart - charCount;
          const newCursorPos = newLineStart + offsetInLine;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
        return;
      }

      // Alt + Down: Move line down
      if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault();
        const { selectionStart, value } = textarea;
        const lines = value.split("\n");
        let currentLineIndex = 0;
        let currentLineStart = 0;

        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length + 1;
          if (charCount + lineLength > selectionStart) {
            currentLineIndex = i;
            currentLineStart = charCount;
            break;
          }
          charCount += lineLength;
        }

        if (currentLineIndex < lines.length - 1) {
          // Swap with next line
          [lines[currentLineIndex], lines[currentLineIndex + 1]] = [
            lines[currentLineIndex + 1],
            lines[currentLineIndex],
          ];
          const newValue = lines.join("\n");

          textarea.value = newValue;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));

          // Move cursor with the line
          const newLineStart =
            currentLineStart + lines[currentLineIndex].length + 1;
          const offsetInLine = selectionStart - currentLineStart;
          const newCursorPos = newLineStart + offsetInLine;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
        return;
      }

      // Ctrl/Cmd + /: Toggle comment
      if (ctrlKey && e.key === "/") {
        e.preventDefault();
        const { selectionStart, selectionEnd, value } = textarea;
        const lines = value.split("\n");
        let startLineIndex = 0;
        let endLineIndex = 0;

        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length + 1;
          if (
            charCount <= selectionStart &&
            selectionStart < charCount + lineLength
          ) {
            startLineIndex = i;
          }
          if (
            charCount <= selectionEnd &&
            selectionEnd <= charCount + lineLength
          ) {
            endLineIndex = i;
            break;
          }
          charCount += lineLength;
        }

        // Toggle comment on selected lines
        const allCommented = lines
          .slice(startLineIndex, endLineIndex + 1)
          .every((line) => line.trim().startsWith("//"));

        for (let i = startLineIndex; i <= endLineIndex; i++) {
          if (allCommented) {
            // Remove comment
            lines[i] = lines[i].replace(/^(\s*)\/\/\s?/, "$1");
          } else {
            // Add comment
            const leadingSpaces = lines[i].match(/^\s*/)?.[0] || "";
            lines[i] =
              leadingSpaces + "// " + lines[i].substring(leadingSpaces.length);
          }
        }

        const newValue = lines.join("\n");
        textarea.value = newValue;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
    },
    [onSave]
  );

  return { handleKeyDown };
}
