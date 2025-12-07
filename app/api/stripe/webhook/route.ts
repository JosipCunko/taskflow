import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanFromPriceId } from "@/app/_lib/stripe";
import { adminDb } from "@/app/_lib/admin";
import Stripe from "stripe";

// Disable body parsing for webhook signature verification
export const runtime = "nodejs";

async function updateUserSubscription(
  userId: string,
  data: {
    currentPlan: "base" | "pro" | "ultra";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string | null;
    planExpiresAt?: number | null;
    freeTrialUsed?: boolean;
  }
) {
  const userRef = adminDb.collection("users").doc(userId);

  // Build update object, filtering out undefined values
  const updateData: Record<string, unknown> = {
    currentPlan: data.currentPlan,
  };

  if (data.stripeCustomerId !== undefined) {
    updateData.stripeCustomerId = data.stripeCustomerId;
  }
  if (data.stripeSubscriptionId !== undefined) {
    updateData.stripeSubscriptionId = data.stripeSubscriptionId;
  }
  if (data.planExpiresAt !== undefined) {
    updateData.planExpiresAt = data.planExpiresAt;
  }
  if (data.freeTrialUsed !== undefined) {
    updateData.freeTrialUsed = data.freeTrialUsed;
  }

  await userRef.update(updateData);
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as "pro" | "ultra" | undefined;
  const isFreeTrial = session.metadata?.isFreeTrial === "true";

  if (!userId || !plan) {
    console.error("Missing userId or plan in checkout session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Get subscription details to find the current period end
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Mark free trial as used if this subscription started with a trial
  const usedFreeTrial = isFreeTrial || subscription.status === "trialing";

  await updateUserSubscription(userId, {
    currentPlan: plan,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    planExpiresAt: subscription.current_period_end * 1000, // Convert to milliseconds
    ...(usedFreeTrial && { freeTrialUsed: true }),
  });

  console.log(
    `User ${userId} subscribed to ${plan} plan${
      usedFreeTrial ? " (free trial)" : ""
    }`
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    const customerId = subscription.customer as string;
    const usersSnapshot = await adminDb
      .collection("users")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.error("Could not find user for subscription update");
      return;
    }

    const userDoc = usersSnapshot.docs[0];
    const price = subscription.items.data[0]?.price;
    const priceId = typeof price === "string" ? price : price?.id;
    const productId =
      price && typeof price !== "string" && typeof price.product === "string"
        ? price.product
        : undefined;
    const plan = priceId ? getPlanFromPriceId(priceId, productId) : "base";

    // Handle cancellation at period end
    if (subscription.cancel_at_period_end) {
      console.log(`User ${userDoc.id} subscription will cancel at period end`);
      // Plan stays active until period end
      await updateUserSubscription(userDoc.id, {
        currentPlan: plan,
        planExpiresAt: subscription.current_period_end * 1000,
      });
      return;
    }

    // Handle active subscription update (upgrade/downgrade)
    if (
      subscription.status === "active" ||
      subscription.status === "trialing"
    ) {
      await updateUserSubscription(userDoc.id, {
        currentPlan: plan,
        stripeSubscriptionId: subscription.id,
        planExpiresAt: subscription.current_period_end * 1000,
      });
      console.log(`User ${userDoc.id} subscription updated to ${plan}`);
    }
    return;
  }

  // If we have userId in metadata
  const price = subscription.items.data[0]?.price;
  const priceId = typeof price === "string" ? price : price?.id;
  const productId =
    price && typeof price !== "string" && typeof price.product === "string"
      ? price.product
      : undefined;
  const plan = priceId ? getPlanFromPriceId(priceId, productId) : "base";

  if (subscription.status === "active" || subscription.status === "trialing") {
    await updateUserSubscription(userId, {
      currentPlan: plan,
      stripeSubscriptionId: subscription.id,
      planExpiresAt: subscription.current_period_end * 1000,
    });
    console.log(`User ${userId} subscription updated to ${plan}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const usersSnapshot = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error("Could not find user for subscription deletion");
    return;
  }

  const userDoc = usersSnapshot.docs[0];

  // Downgrade to base plan
  await updateUserSubscription(userDoc.id, {
    currentPlan: "base",
    stripeSubscriptionId: null,
    planExpiresAt: null,
  });

  console.log(`User ${userDoc.id} downgraded to base plan`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const usersSnapshot = await adminDb
    .collection("users")
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error("Could not find user for failed payment");
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  console.log(`Payment failed for user ${userDoc.id}`);

  // You could send a notification to the user here
  // For now, Stripe will handle retry logic automatically
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
