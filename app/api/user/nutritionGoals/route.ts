import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getUserNutritionGoals } from "@/app/_lib/user-admin";
import { authOptions } from "@/app/_lib/auth";
import { defaultNutritionGoals } from "@/app/_utils/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await getUserNutritionGoals(session.user.id);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error getting user nutrition goals:", error);
    return NextResponse.json(
      {
        message: "Error getting user nutrition goals",
        data: defaultNutritionGoals,
      },
      { status: 500 }
    );
  }
}
