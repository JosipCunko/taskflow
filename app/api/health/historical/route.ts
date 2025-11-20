import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/_lib/auth";
import { getHistoricalNutritionData } from "@/app/_lib/healthActions";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { monthsBack } = await request.json();

    if (!monthsBack || typeof monthsBack !== "number" || monthsBack <= 0) {
      return NextResponse.json(
        { error: "Invalid monthsBack parameter" },
        { status: 400 }
      );
    }

    const result = await getHistoricalNutritionData(monthsBack);

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error getting historical nutrition data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch historical nutrition data" },
      { status: 500 }
    );
  }
}
