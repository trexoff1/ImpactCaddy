# ImpactCaddy

A subscription-based golf and charity platform built with Next.js 15, Supabase, and Stripe. Players subscribe, log Stableford scores, enter monthly draws, and direct a portion of their subscription to a charity of their choice.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (Auth + Postgres + RLS)
- Stripe (subscriptions, billing portal, webhooks)

## Project Structure

```
src/
  app/
    auth/login/       # Login page (page.tsx + LoginPageClient.tsx)
    auth/signup/      # Signup page
    dashboard/        # User dashboard (scores, draws, leaderboard, winnings, profile, charity)
    admin/            # Admin pages (draws, winners, users, charities)
    api/              # API routes (stripe, admin, auth, winnings)
  lib/
    supabase/         # Supabase client, server, admin, middleware helpers
    stripe.ts         # Stripe client
    draw-engine.ts    # Draw simulation logic
    admin-auth.ts     # Admin route protection
    types.ts          # Shared domain types
supabase/
  schema.sql          # Full DB schema, RLS policies, triggers, seed data
```

## Subscription Tiers

Each tier is available monthly or yearly.

## Features

### User
- Signup / login / logout
- Stripe subscription checkout and billing portal
- Stableford score tracking (rolling 5-score max)
- Monthly draw entry
- Charity selection with configurable contribution %
- Leaderboard
- Winnings page with proof submission

### Admin
- Draw simulation (random or algorithmic)
- Draw publishing
- Winner management (pending → paid workflow)
- User and charity management

## Prerequisites

- Node.js 18+
- npm
- Supabase project
- Stripe account
- Stripe CLI (for local webhook testing)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in all values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_BIRDIE_MONTHLY=
STRIPE_PRICE_BIRDIE_YEARLY=
STRIPE_PRICE_EAGLE_MONTHLY=
STRIPE_PRICE_EAGLE_YEARLY=
STRIPE_PRICE_ALBATROSS_MONTHLY=
STRIPE_PRICE_ALBATROSS_YEARLY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase

1. Open the Supabase SQL Editor.
2. Run `supabase/schema.sql` — this creates all tables, RLS policies, triggers, and seeds 5 charities.
3. Confirm these tables exist: `profiles`, `subscriptions`, `scores`, `draws`, `draw_entries`, `draw_results`, `draw_winners`, `winner_verifications`, `charities`, `transactions`.

### 4. Set up Stripe products

Create recurring prices for each plan/interval and copy the price IDs into the matching `STRIPE_PRICE_*` env vars.

### 5. Set up Stripe webhook

Endpoint: `POST /api/stripe/webhook`

Required events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

For local development:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed signing secret to `STRIPE_WEBHOOK_SECRET`.

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin Access

Admin routes are protected by `profiles.is_admin = true`.

To promote a user:

```sql
UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_UUID';
```

Then sign out and back in. Admin routes: `/admin`, `/admin/draws`, `/admin/winners`, `/admin/users`, `/admin/charities`.

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Run production server
npm run lint     # Lint codebase
```

## Troubleshooting

**Login page not loading** — ensure the file is `src/app/auth/login/page.tsx` (lowercase `p`). Next.js App Router only recognises lowercase `page.tsx` as a route entry point.

**Webhook not updating subscription** — verify `STRIPE_WEBHOOK_SECRET` and check Stripe event delivery logs.

**Checkout fails with missing price** — one or more `STRIPE_PRICE_*` env vars are empty or incorrect.

**Admin pages redirect to dashboard** — `profiles.is_admin` is `false` for your user.

**API unauthorized errors** — ensure the user is signed in and Supabase URL/keys are valid.

## Deployment

- Set all env vars on your hosting platform.
- Set `NEXT_PUBLIC_APP_URL` to your deployed domain.
- Use production Stripe keys and webhook endpoint.
- Re-run `supabase/schema.sql` if deploying to a fresh Supabase project.
