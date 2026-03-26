import { NextResponse } from "next/server";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { getPriceId, getStripe, type BillingInterval, type SubscriptionTier } from "@/lib/stripe";

interface CheckoutBody {
  tier: SubscriptionTier;
  interval: BillingInterval;
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CheckoutBody;
    const tier = body?.tier;
    const interval = body?.interval;

    if (!tier || !interval) {
      return NextResponse.json({ error: "Missing tier or interval" }, { status: 400 });
    }

    const priceId = getPriceId(tier, interval);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${appUrl}/dashboard/profile?checkout=success`,
      cancel_url: `${appUrl}/dashboard/profile?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        tier,
        interval,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier,
          interval,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
