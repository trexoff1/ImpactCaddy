import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
    });
  }

  return stripeClient;
}

export type BillingInterval = "monthly" | "yearly";
export type SubscriptionTier = "birdie" | "eagle" | "albatross";

const PRICE_IDS: Record<SubscriptionTier, Record<BillingInterval, string | undefined>> = {
  birdie: {
    monthly: process.env.STRIPE_PRICE_BIRDIE_MONTHLY,
    yearly: process.env.STRIPE_PRICE_BIRDIE_YEARLY,
  },
  eagle: {
    monthly: process.env.STRIPE_PRICE_EAGLE_MONTHLY,
    yearly: process.env.STRIPE_PRICE_EAGLE_YEARLY,
  },
  albatross: {
    monthly: process.env.STRIPE_PRICE_ALBATROSS_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ALBATROSS_YEARLY,
  },
};

export function getPriceId(tier: SubscriptionTier, interval: BillingInterval) {
  const priceId = PRICE_IDS[tier]?.[interval];
  if (!priceId) {
    throw new Error(`Missing Stripe price id for ${tier}/${interval}`);
  }
  return priceId;
}

export function resolveTierFromPriceId(priceId: string): SubscriptionTier | null {
  const tiers = Object.keys(PRICE_IDS) as SubscriptionTier[];

  for (const tier of tiers) {
    const intervals = PRICE_IDS[tier];
    if (intervals.monthly === priceId || intervals.yearly === priceId) {
      return tier;
    }
  }

  return null;
}
