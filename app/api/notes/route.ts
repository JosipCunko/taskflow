import { NextResponse } from "next/server";
import { authOptions } from "@/app/_lib/auth";
import { getServerSession } from "next-auth";
import { loadNotesByUserId } from "@/app/_lib/notes";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await loadNotesByUserId(session.user.id);
    return NextResponse.json({ data: notes });
  } catch (error) {
    console.error("Error in notes API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
