"use client";

import { useState, useEffect, useCallback } from "react";
import { Note } from "@/app/_types/types";
import {
  addNoteAction,
  updateNoteAction,
  deleteNoteAction,
} from "@/app/_lib/notesActions";
import Button from "@/app/_components/reusable/Button";
import Input from "@/app/_components/reusable/Input";
import { PlusCircle, Save, Trash2, XCircle, Edit3 } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatDateTime } from "@/app/_utils/utils";

interface NotesClientUIProps {
  initialNotes: Note[];
  userId: string;
}

const ReusableTextarea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) => (
  <textarea
    {...props}
    className={`block w-full px-3 py-2 bg-background-700 border border-divider rounded-md shadow-sm placeholder-text-low focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-text-low disabled:opacity-70 disabled:bg-background-550 ${props.className}`}
  />
);

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
    } catch (e: unknown) {
      const error = e as { message?: string };
      console.error("Add note client error:", error);
      toast.error(error.message ?? "An error occurred while adding the note.");
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
    } catch (e: unknown) {
      const error = e as { message?: string };
      console.error("Save note client error:", error);
      toast.error(error.message ?? "An error occurred while saving the note.");
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
      } catch (e: unknown) {
        const error = e as { message?: string };
        console.error("Delete note client error:", error);
        toast.error(
          error.message ?? "An error occurred while deleting the note."
        );
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    // Optionally, revert title/content if changes were made but not saved
  };

  return (
    <div>
      <Button
        onClick={handleAddNewNote}
        variant="primary"
        className="mb-6"
        disabled={isAdding || !canAddNewNote() || !!editingNoteId}
      >
        <PlusCircle size={18} className="mr-2" />{" "}
        {isAdding ? "Adding Note..." : "Add New Note"}
      </Button>
      {editingNoteId && (
        <p className="mb-4 text-sm text-text-gray italic">
          You are currently editing a note. Save or cancel to add a new one.
        </p>
      )}

      {notes.length === 0 && !isAdding && (
        <p className="text-center text-text-gray py-8">
          You don&apos;t have any notes yet. Click &quot;Add New Note&quot; to
          get started!
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-background-650 p-4 rounded-lg shadow-lg flex flex-col justify-between min-h-[200px]"
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
                <ReusableTextarea
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  placeholder="Note content..."
                  rows={6}
                  className="flex-grow resize-none bg-background-600 border-background-500 focus:border-primary-400"
                  disabled={isSaving}
                />
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
                <p className="text-text-low text-sm line-clamp-5 whitespace-pre-wrap flex-grow mb-2">
                  {note.content || (
                    <span className="italic text-text-gray">
                      Empty note. Click pencil to edit.
                    </span>
                  )}
                </p>
                <div className="flex justify-between items-center mt-auto pt-2 text-xs text-text-gray">
                  <span>Updated: {formatDateTime(note.updatedAt)}</span>
                  <div className="flex space-x-2">
                    <Button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleEdit(note);
                      }}
                      variant="tag"
                      className="text-text-gray hover:text-primary-400"
                    >
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleDelete(note.id);
                      }}
                      variant="tag"
                      className="text-text-gray hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
