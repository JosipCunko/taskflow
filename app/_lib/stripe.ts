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

export function getPromptsPerDay(plan: SubscriptionPlan): number {
  if (plan === "base") return 1;
  return PLAN_CONFIG[plan].promptsPerDay;
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

export function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_ULTRA_PRICE_ID) return "ultra";
  return "base";
}
