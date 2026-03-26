import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, resolveTierFromPriceId, type SubscriptionTier } from "@/lib/stripe";

export const runtime = "nodejs";

function mapSubscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === "active") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  return "trialing";
}

function getTierFromSubscription(subscription: Stripe.Subscription): SubscriptionTier {
  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  const fromPrice = priceId ? resolveTierFromPriceId(priceId) : null;
  const fromMetadata = subscription.metadata?.tier as SubscriptionTier | undefined;
  return fromPrice || fromMetadata || "birdie";
}

async function upsertSubscriptionForUser(params: {
  userId: string;
  subscription: Stripe.Subscription;
  tier: SubscriptionTier;
}) {
  const admin = createAdminClient();
  const mappedStatus = mapSubscriptionStatus(params.subscription.status);
  const firstItem = params.subscription.items.data[0];
  const periodStart = firstItem?.current_period_start || Math.floor(Date.now() / 1000);
  const periodEnd = firstItem?.current_period_end || Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  await admin.from("subscriptions").upsert(
    {
      user_id: params.userId,
      tier: params.tier,
      status: mappedStatus,
      stripe_subscription_id: params.subscription.id,
      current_period_start: new Date(periodStart * 1000).toISOString(),
      current_period_end: new Date(periodEnd * 1000).toISOString(),
    },
    { onConflict: "user_id" }
  );

  await admin
    .from("profiles")
    .update({
      subscription_tier: params.tier,
      subscription_status: mappedStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.userId);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription;
      const userId = session.metadata?.user_id;

      if (typeof subscriptionId === "string" && userId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const tier = getTierFromSubscription(subscription);
        await upsertSubscriptionForUser({ userId, subscription, tier });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const admin = createAdminClient();

      const { data: existing } = await admin
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      const userId = existing?.user_id || subscription.metadata?.user_id;
      if (userId) {
        const tier = getTierFromSubscription(subscription);
        await upsertSubscriptionForUser({ userId, subscription, tier });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
