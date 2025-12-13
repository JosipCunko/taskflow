"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Note } from "@/app/_types/types";
import {
  addNoteAction,
  updateNoteAction,
  deleteNoteAction,
} from "@/app/_lib/notesActions";
import Button from "@/app/_components/reusable/Button";
import Input from "@/app/_components/reusable/Input";
import { PlusCircle, Save, Trash2, XCircle, Edit3, Sigma } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatDateTime } from "@/app/_utils/utils";
import { Tooltip } from "react-tooltip";
import AutoGrowTextarea from "@/app/_components/notes/AutoGrowTextarea";
import MathSymbolsModal from "@/app/_components/notes/MathSymbolsModal";
import KeyboardShortcutsGuide from "@/app/_components/notes/KeyboardShortcutsGuide";
import NotesWelcome from "@/app/_components/notes/NotesWelcome";
import NoteStats from "@/app/_components/notes/NoteStats";
import NoteExport from "@/app/_components/notes/NoteExport";
import Search from "@/app/_components/reusable/Search";
import NoteContentPreview from "@/app/_components/notes/NoteContentPreview";
import { useTextEditorShortcuts } from "@/app/_hooks/useTextEditorShortcuts";

interface NotesClientUIProps {
  initialNotes: Note[];
  userId: string;
}

export default function NotesClientUI({
  initialNotes,
  userId,
}: NotesClientUIProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const canAddNewNote = useCallback(() => {
    return !notes.some((note) => !note.title.trim() && !note.content.trim());
  }, [notes]);

  const handleAddNewNote = async () => {
    if (!canAddNewNote()) {
      toast.error(
        "Please provide a title or content for the current empty note before adding a new one."
      );
      return;
    }
    setIsAdding(true);
    try {
      const result = await addNoteAction(userId, "New Note", "");
      if (result.success && result.newNoteId) {
        const newServerNote: Note = {
          id: result.newNoteId,
          userId,
          title: "New Note",
          content: "",
          updatedAt: Date.now(),
        };
        setNotes((prev) => [newServerNote, ...prev]);
        setEditingNoteId(result.newNoteId);
        setCurrentTitle("New Note");
        setCurrentContent("");
        toast.success(result?.message || "Note added.");
      } else {
        toast.error(result.error ?? "Failed to add note.");
      }
    } catch (error) {
      console.error("Add note client error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while adding the note."
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setCurrentTitle(note.title);
    setCurrentContent(note.content);
  };

  const handleSave = async (noteId: string) => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const result = await updateNoteAction(
        noteId,
        currentTitle,
        currentContent,
        userId
      );
      if (result.success) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  title: currentTitle,
                  content: currentContent,
                  updatedAt: Date.now(),
                } // Optimistic update
              : n
          )
        );
        setEditingNoteId(null);
        toast.success(result.message || "Note updated.");
      } else {
        toast.error(result.error ?? "Failed to update note.");
      }
    } catch (error) {
      console.error("Save note client error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the note."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!userId) return;
    const noteToDelete = notes.find((n) => n.id === noteId);
    if (noteToDelete) {
      try {
        const result = await deleteNoteAction(noteId, userId);
        if (result.success) {
          setNotes((prev) => prev.filter((n) => n.id !== noteId));
          if (editingNoteId === noteId) {
            setEditingNoteId(null);
          }
          toast.success(result.message || "Note deleted.");
        } else {
          toast.error(result.error ?? "Failed to delete note.");
        }
      } catch (error) {
        console.error("Delete note client error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the note."
        );
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    // Optionally, revert title/content if changes were made but not saved
  };

  const handleSymbolSelect = (symbol: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const newValue =
        value.substring(0, start) + symbol + value.substring(end);
      setCurrentContent(newValue);

      // Set cursor position after the inserted symbol
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + symbol.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const { handleKeyDown } = useTextEditorShortcuts({
    textareaRef,
    onSave: editingNoteId ? () => handleSave(editingNoteId) : undefined,
  });

  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleAddNewNote}
            variant="primary"
            disabled={isAdding || !canAddNewNote() || !!editingNoteId}
          >
            <PlusCircle size={18} className="mr-2" />{" "}
            {isAdding ? "Adding Note..." : "Add New Note"}
          </Button>
        </div>
        <KeyboardShortcutsGuide />
      </div>
      {editingNoteId && (
        <div className="mb-4 p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg border border-primary-500/30 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✨</div>
            <div className="flex-1">
              <p className="text-sm text-text-low font-medium mb-2">
                <span className="text-primary-400 font-bold">
                  Advanced Editor Active
                </span>
              </p>
              <p className="text-xs text-text-gray">
                Quick tips: <kbd className="kbd">Ctrl+S</kbd> Save •{" "}
                <kbd className="kbd">Ctrl+D</kbd> Duplicate •{" "}
                <kbd className="kbd">Alt+↑/↓</kbd> Move line •{" "}
                <kbd className="kbd">Ctrl+/</kbd> Comment
              </p>
            </div>
          </div>
        </div>
      )}

      {notes.length === 0 && !isAdding && <NotesWelcome />}

      {notes.length > 0 && (
        <div className="mb-6">
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes by title or content..."
            filteredCount={filteredNotes.length}
            totalCount={notes.length}
            itemLabel="notes"
          />
        </div>
      )}

      {filteredNotes.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-text-gray text-lg mb-2">No notes found</p>
          <p className="text-text-gray text-sm">
            Try searching with different keywords
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-background-650 p-4 rounded-lg shadow-lg hover:shadow-xl hover:border-primary-500/30 border border-transparent transition-all duration-200 flex flex-col justify-between min-h-[200px]"
          >
            {editingNoteId === note.id ? (
              <div className="space-y-3 flex flex-col flex-grow">
                <Input
                  name="title"
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="Note title"
                  className="text-lg font-semibold bg-background-600 border-background-500 focus:border-primary-400"
                />
                <AutoGrowTextarea
                  ref={textareaRef}
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Note content..."
                  className="flex-grow bg-background-600 border-background-500 focus:border-primary-400 font-mono"
                  disabled={isSaving}
                />
                <div className="relative bg-background-650">
                  <Button
                    onClick={() => setIsMathModalOpen(true)}
                    variant="secondary"
                    disabled={!editingNoteId}
                    data-tooltip-id="math-symbols-btn"
                    data-tooltip-content="Insert mathematical symbols"
                  >
                    <Sigma size={18} /> Math Symbols
                  </Button>
                  <Tooltip id="math-symbols-btn" place="top" />
                  <MathSymbolsModal
                    isOpen={isMathModalOpen}
                    onClose={() => setIsMathModalOpen(false)}
                    onSymbolSelect={handleSymbolSelect}
                  />
                </div>
                <div className="mt-2 p-2 bg-background-700 rounded border border-divider">
                  <NoteStats content={currentContent} />
                </div>
                <div className="flex items-center justify-end space-x-2 mt-auto pt-3">
                  <Button
                    onClick={() => handleSave(note.id)}
                    variant="primary"
                    disabled={isSaving}
                  >
                    <Save size={16} className="mr-1.5" />{" "}
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="secondary"
                    disabled={isSaving}
                  >
                    <XCircle size={16} className="mr-1.5" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-text-low truncate mb-1">
                  {note.title || (
                    <span className="italic text-text-gray">Untitled</span>
                  )}
                </h3>
                <div
                  className="flex-grow mb-2 overflow-hidden"
                  style={{ maxHeight: "200px" }}
                >
                  {note.content ? (
                    <div className="line-clamp-5 overflow-hidden">
                      <NoteContentPreview content={note.content} />
                    </div>
                  ) : (
                    <span className="italic text-text-gray text-sm">
                      Empty note. Click pencil to edit.
                    </span>
                  )}
                </div>
                <div className="mt-auto pt-2 space-y-2">
                  <div className="p-2 bg-background-700 rounded border border-divider">
                    <NoteStats content={note.content} />
                  </div>
                  <div className="flex justify-between items-center text-xs text-text-gray">
                    <span>Updated: {formatDateTime(note.updatedAt)}</span>
                    <div className="flex space-x-1">
                      <NoteExport title={note.title} content={note.content} />
                      <Button
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleEdit(note);
                        }}
                        variant="tag"
                        className="text-text-gray hover:text-primary-400 p-2"
                      >
                        <Edit3 size={16} />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleDelete(note.id);
                        }}
                        variant="tag"
                        className="text-text-gray hover:text-red-500 p-2"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .kbd {
          padding: 2px 6px;
          background: var(--background-600);
          border: 1px solid var(--divider);
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85em;
          margin: 0 2px;
        }
      `}</style>
    </div>
  );
}
