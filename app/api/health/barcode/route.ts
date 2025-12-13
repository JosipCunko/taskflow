import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { readBarcodes, type ReaderOptions } from "zxing-wasm/reader";
import {
  BarcodeProductResponse,
  NutrientLevels,
  NutrientLevel,
} from "@/app/_types/types";

const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2/product";
const USER_AGENT = "TaskFlow/1.0 (taskflow-health-scanner)";

interface OpenFoodFactsResponse {
  status: number;
  status_verbose: string;
  code: string;
  product?: {
    product_name?: string;
    brands?: string;
    quantity?: string;
    nutriscore_grade?: string;
    nova_group?: number;
    nutriments?: {
      "energy-kcal_100g"?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      fiber_100g?: number;
      sugars_100g?: number;
      sodium_100g?: number;
      "saturated-fat_100g"?: number;
      salt_100g?: number;
    };
    nutrient_levels?: {
      fat?: "low" | "moderate" | "high";
      "saturated-fat"?: "low" | "moderate" | "high";
      sugars?: "low" | "moderate" | "high";
      salt?: "low" | "moderate" | "high";
    };
    ingredients_text?: string;
    ingredients_analysis_tags?: string[];
    image_front_url?: string;
  };
}

async function decodeBarcode(imageBuffer: ArrayBuffer): Promise<string | null> {
  const readerOptions: ReaderOptions = {
    tryHarder: true,
    formats: ["EAN-13", "EAN-8", "UPC-A", "UPC-E", "Code128", "Code39"],
    maxNumberOfSymbols: 1,
  };

  const results = await readBarcodes(new Blob([imageBuffer]), readerOptions);

  if (results.length > 0 && results[0].isValid) {
    return results[0].text;
  }

  return null;
}

async function fetchProductFromOFF(
  barcode: string
): Promise<BarcodeProductResponse | null> {
  const response = await fetch(`${OFF_API_BASE}/${barcode}.json`, {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data: OpenFoodFactsResponse = await response.json();

  if (data.status !== 1 || !data.product) {
    return null;
  }

  const product = data.product;
  const nutriments = product.nutriments || {};

  // Parse ingredients analysis for vegan/vegetarian status
  const analysisTags = product.ingredients_analysis_tags || [];
  const isVegan = analysisTags.includes("en:vegan");
  const isVegetarian =
    analysisTags.includes("en:vegetarian") || analysisTags.includes("en:vegan");

  // Parse ingredients text into array
  const ingredients = product.ingredients_text
    ? product.ingredients_text
        .split(/,|;/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0)
    : [];

  // Parse nutrient levels
  const nutrientLevels: NutrientLevels = {};
  const levels = product.nutrient_levels;
  if (levels) {
    if (levels.fat) {
      nutrientLevels.fat = {
        level: levels.fat as NutrientLevel,
        per100g: Math.round((nutriments.fat_100g || 0) * 10) / 10,
      };
    }
    if (levels["saturated-fat"]) {
      nutrientLevels.saturatedFat = {
        level: levels["saturated-fat"] as NutrientLevel,
        per100g: Math.round((nutriments["saturated-fat_100g"] || 0) * 10) / 10,
      };
    }
    if (levels.sugars) {
      nutrientLevels.sugars = {
        level: levels.sugars as NutrientLevel,
        per100g: Math.round((nutriments.sugars_100g || 0) * 10) / 10,
      };
    }
    if (levels.salt) {
      nutrientLevels.salt = {
        level: levels.salt as NutrientLevel,
        per100g: Math.round((nutriments.salt_100g || 0) * 10) / 10,
      };
    }
  }

  return {
    barcode,
    name: product.product_name || "Unknown Product",
    producer: product.brands || undefined,
    quantity: product.quantity || undefined,
    nutriScore: product.nutriscore_grade as
      | "a"
      | "b"
      | "c"
      | "d"
      | "e"
      | undefined,
    novaGroup: product.nova_group as 1 | 2 | 3 | 4 | undefined,
    nutrientsPer100g: {
      calories: Math.round(nutriments["energy-kcal_100g"] || 0),
      protein: Math.round((nutriments.proteins_100g || 0) * 10) / 10,
      carbs: Math.round((nutriments.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((nutriments.fat_100g || 0) * 10) / 10,
      fiber: nutriments.fiber_100g
        ? Math.round(nutriments.fiber_100g * 10) / 10
        : undefined,
      sugar: nutriments.sugars_100g
        ? Math.round(nutriments.sugars_100g * 10) / 10
        : undefined,
      sodium: nutriments.sodium_100g
        ? Math.round(nutriments.sodium_100g * 1000) // Convert to mg
        : undefined,
    },
    ingredients,
    isVegan: isVegan || undefined,
    isVegetarian: isVegetarian || undefined,
    nutrientLevels:
      Object.keys(nutrientLevels).length > 0 ? nutrientLevels : undefined,
    imageUrl: product.image_front_url || undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Invalid image type. Please upload JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Decode barcode from image
    const imageBuffer = await imageFile.arrayBuffer();
    const barcode = await decodeBarcode(imageBuffer);

    if (!barcode) {
      return NextResponse.json(
        {
          error:
            "Could not detect a barcode in the image. Please try again with a clearer photo.",
        },
        { status: 400 }
      );
    }

    // Fetch product info from Open Food Facts
    const product = await fetchProductFromOFF(barcode);

    if (!product) {
      return NextResponse.json(
        {
          error: `Product not found in Open Food Facts database for barcode: ${barcode}`,
          barcode,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Barcode scanning error:", error);
    return NextResponse.json(
      { error: "Failed to process barcode image" },
      { status: 500 }
    );
  }
}
