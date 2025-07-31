import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/_lib/auth";
import { getRandomRecipes } from "@/app/_lib/spoonacular-admin";
import { SpoonacularRecipeInfo } from "@/app/_types/spoonacularTypes";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { number, includeTags, excludeTags, limitLicense } =
      await request.json();
    const result = await getRandomRecipes({
      number,
      includeTags,
      excludeTags,
      limitLicense,
    });
    return NextResponse.json({ data: result.recipes });
  } catch (error) {
    console.error("Error getting user nutrition goals:", error);
    return NextResponse.json(
      {
        message: "Error getting user nutrition goals",
        data: [] as SpoonacularRecipeInfo[],
      },
      { status: 500 }
    );
  }
}
