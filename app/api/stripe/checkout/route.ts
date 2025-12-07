import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import {
  stripe,
  PLAN_CONFIG,
  getOrCreateStripeCustomer,
  resolvePriceId,
} from "@/app/_lib/stripe";
import { getUserById } from "@/app/_lib/user-admin";
import { SubscriptionPlan } from "@/app/_types/types";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { error: "You must be logged in to subscribe" },
        { status: 401 }
      );
    }

    const { plan } = await request.json();

    if (!plan || !["pro", "ultra"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const selectedPlan = plan as Exclude<SubscriptionPlan, "base">;
    const planConfig = PLAN_CONFIG[selectedPlan];

    if (!planConfig.priceId) {
      return NextResponse.json(
        { error: "Plan not configured. Please contact support." },
        { status: 500 }
      );
    }

    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an active subscription
    if (user.currentPlan !== "base" && user.stripeSubscriptionId) {
      return NextResponse.json(
        {
          error:
            "You already have an active subscription. Use the customer portal to manage it.",
        },
        { status: 400 }
      );
    }

    const customerId =
      user.stripeCustomerId ||
      (await getOrCreateStripeCustomer(
        session.user.id,
        session.user.email,
        session.user.name || undefined
      ));

    // Only allow free trial if user hasn't used it before
    const trialDays =
      user.freeTrialUsed || planConfig.trialDays === 0
        ? 0
        : planConfig.trialDays;

    // Resolve priceId (supports both price_ and prod_ configs)
    const resolvedPriceId = await resolvePriceId(planConfig.priceId);

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        ...(trialDays > 0 && { trial_period_days: trialDays }),
        metadata: {
          userId: session.user.id,
          plan: selectedPlan,
          isFreeTrial: trialDays > 0 ? "true" : "false",
        },
      },
      success_url: `${process.env.NEXTAUTH_URL}/webapp?subscription=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/#pricing`,
      metadata: {
        userId: session.user.id,
        plan: selectedPlan,
        isFreeTrial: trialDays > 0 ? "true" : "false",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
