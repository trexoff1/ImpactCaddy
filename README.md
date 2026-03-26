# GolfGives

GolfGives is a subscription-based golf and charity platform built with Next.js, Supabase, and Stripe.

Users can:
- Sign up and subscribe (monthly or yearly)
- Log Stableford scores (latest 5 retained)
- Join monthly draws
- Support charities
- Track winnings and payout status

Admins can:
- Run draw simulations before publishing
- Publish official draw results
- Verify winners and move payout state from pending to paid

## Features

### Subscriber Features
- Authentication (signup/login/logout)
- Profile management
- Stripe subscription checkout and billing portal
- Subscription status and renewal date in dashboard
- Score management with 5-score rolling logic
- Draw entry flow
- Leaderboard
- Charity selection and impact display
- Winnings page with proof submission

### Admin Features
- Admin-protected routes
- Draw simulation (random or algorithmic)
- Draw publishing
- Winner management and payout state workflow

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Supabase (Auth + Postgres + RLS)
- Stripe (subscriptions + billing portal + webhooks)

## Project Structure

- src/app: pages, layouts, API routes
- src/lib: helper modules for Supabase, Stripe, draw engine, admin auth
- supabase/schema.sql: full database schema and RLS policies
- .env.example: required environment variables

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm
- Supabase project
- Stripe account
- Stripe CLI (recommended for local webhook testing)

## Setup Guide

### 1. Install dependencies

Run in project root:

npm install

### 2. Create env file

Create a new file named .env in the project root and copy values from .env.example.

Required values:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_BIRDIE_MONTHLY
- STRIPE_PRICE_BIRDIE_YEARLY
- STRIPE_PRICE_EAGLE_MONTHLY
- STRIPE_PRICE_EAGLE_YEARLY
- STRIPE_PRICE_ALBATROSS_MONTHLY
- STRIPE_PRICE_ALBATROSS_YEARLY
- NEXT_PUBLIC_APP_URL

### 3. Setup Supabase database

1. Open Supabase SQL Editor.
2. Paste and execute supabase/schema.sql.
3. Confirm tables exist, including:
   - profiles
   - subscriptions
   - scores
   - draws
   - draw_entries
   - draw_results
   - draw_winners

### 4. Setup Stripe products and prices

Create recurring prices for each plan/interval:

- Birdie Monthly
- Birdie Yearly
- Eagle Monthly
- Eagle Yearly
- Albatross Monthly
- Albatross Yearly

Copy each Stripe price id into matching env variables.

### 5. Setup Stripe webhook

Create a webhook endpoint:

- Local: http://localhost:3000/api/stripe/webhook
- Production: https://your-domain/api/stripe/webhook

Enable events:

- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted

Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET.

For local development with Stripe CLI:

1. stripe login
2. stripe listen --forward-to localhost:3000/api/stripe/webhook
3. Use printed signing secret for local STRIPE_WEBHOOK_SECRET

### 6. Run the app

npm run dev

Open http://localhost:3000

## Admin Access

Admin pages are protected and require profiles.is_admin = true.

To promote a user:

1. Open Supabase SQL Editor.
2. Run:

update profiles set is_admin = true where id = 'YOUR_USER_UUID';

3. Sign out and sign in again.
4. Visit /admin.

Admin routes:
- /admin
- /admin/draws
- /admin/winners

## Available Scripts

- npm run dev: start development server
- npm run build: production build
- npm run start: run production server
- npm run lint: lint codebase

## Testing Checklist

- Signup and login works
- Profile save works
- Stripe checkout redirects and completes
- Webhook updates subscription status
- Dashboard shows subscription status and renewal date
- Score creation/edit/deletion works and keeps latest 5
- Draw entry works
- Admin simulation and publish works
- Winner verification status updates work
- Winnings page proof submission works

## Troubleshooting

### Webhook not updating subscription

- Verify STRIPE_WEBHOOK_SECRET is correct
- Verify webhook endpoint URL
- Check Stripe event delivery logs

### Checkout fails with missing price

- One or more STRIPE_PRICE_* values are empty or incorrect

### Admin pages redirect to dashboard

- profiles.is_admin is false for your user

### API unauthorized errors

- Ensure user is logged in
- Ensure Supabase URL/keys are valid

## Deployment Notes

- Set all env variables in your hosting platform
- Set NEXT_PUBLIC_APP_URL to deployed URL
- Use production Stripe keys and webhook endpoint
- Re-run Supabase schema if deploying to a fresh project

## Notes

- The root layout uses suppressHydrationWarning to avoid false hydration warnings from external runtime-injected attributes in some environments.
