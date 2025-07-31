import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/_lib/auth";
import { getDailyNutritionSummary } from "@/app/_lib/spoonacular-admin";
import { defaultDailyNutritionSummary } from "@/app/_utils/healthUtils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { date } = await request.json();
    const result = await getDailyNutritionSummary(session.user.id, date);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error getting user nutrition goals:", error);
    return NextResponse.json(
      {
        message: "Error getting daily nutrition summary",
        data: defaultDailyNutritionSummary,
      },
      { status: 500 }
    );
  }
}
