import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { loadNotesByUserId } from "@/app/_lib/notes";
import { Note } from "@/app/_types/types";
import NotesClientUI from "./NotesClientUI";
import { redirect } from "next/navigation";

export default async function NotesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  let initialNotes: Note[] = [];
  try {
    initialNotes = await loadNotesByUserId(userId);
  } catch (error) {
    console.error("Failed to load initial notes for page:", error);
  }

  return (
    <div className="container mx-auto p-1 sm:p-6 max-h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-400">
          My Notes
        </h1>
        <p className="text-text-low mt-1">
          Create and manage your personal notes.
        </p>
      </div>
      <NotesClientUI initialNotes={initialNotes} userId={userId} />
    </div>
  );
}
