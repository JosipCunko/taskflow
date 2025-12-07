import Stripe from "stripe";
import { SubscriptionPlan } from "../_types/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PLAN_CONFIG: Record<
  Exclude<SubscriptionPlan, "base">,
  {
    priceId: string;
    name: string;
    price: number;
    promptsPerDay: number;
    trialDays: number;
  }
> = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    name: "Pro",
    price: 4.99,
    promptsPerDay: 10,
    trialDays: 7,
  },
  ultra: {
    priceId: process.env.STRIPE_ULTRA_PRICE_ID!,
    name: "Ultra",
    price: 14.99,
    promptsPerDay: Infinity,
    trialDays: 0,
  },
};

/**
 * Ensures we have a valid Stripe Price ID.
 * If a Product ID (prod_...) is provided, it resolves the product's default price.
 */
export async function resolvePriceId(rawId: string): Promise<string> {
  if (!rawId) {
    throw new Error("Missing Stripe price ID configuration.");
  }

  if (rawId.startsWith("price_")) {
    return rawId;
  }

  if (rawId.startsWith("prod_")) {
    const product = await stripe.products.retrieve(rawId);
    const defaultPrice = product.default_price;
    if (typeof defaultPrice === "string" && defaultPrice.startsWith("price_")) {
      return defaultPrice;
    }
    throw new Error(
      "Stripe product has no default price configured. Please set a price_ ID."
    );
  }

  throw new Error(
    "Invalid Stripe price configuration. Expecting price_ or prod_ identifier."
  );
}

export function getPromptsPerDay(plan: SubscriptionPlan): number {
  if (plan === "base") return 1;
  return PLAN_CONFIG[plan].promptsPerDay;
}

/**
 * Returns the effective plan considering expiration.
 * If planExpiresAt is set and has passed, returns "base".
 */
export function getEffectivePlan(
  currentPlan: SubscriptionPlan,
  planExpiresAt?: number | null
): SubscriptionPlan {
  // If no expiration set or plan is base, return as-is
  if (!planExpiresAt || currentPlan === "base") {
    return currentPlan;
  }

  // Check if plan has expired
  if (planExpiresAt < Date.now()) {
    return "base";
  }

  return currentPlan;
}

export function canMakePrompt(
  plan: SubscriptionPlan,
  promptsToday: number
): boolean {
  const limit = getPromptsPerDay(plan);
  if (limit === Infinity) return true;
  return promptsToday < limit;
}

export function getRemainingPrompts(
  plan: SubscriptionPlan,
  promptsToday: number
): number | "unlimited" {
  const limit = getPromptsPerDay(plan);
  if (limit === Infinity) return "unlimited";
  return Math.max(0, limit - promptsToday);
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // Search for existing customer by metadata
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

export function getPlanFromPriceId(
  priceId: string,
  productId?: string
): SubscriptionPlan {
  const proId = process.env.STRIPE_PRO_PRICE_ID;
  const ultraId = process.env.STRIPE_ULTRA_PRICE_ID;

  if (priceId && proId && priceId === proId) return "pro";
  if (priceId && ultraId && priceId === ultraId) return "ultra";

  // If env is product-based, match on productId
  if (productId && proId && proId.startsWith("prod_") && productId === proId)
    return "pro";
  if (
    productId &&
    ultraId &&
    ultraId.startsWith("prod_") &&
    productId === ultraId
  )
    return "ultra";

  return "base";
}
