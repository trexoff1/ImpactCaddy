-- ============================================================
-- GolfGives — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables.
-- ============================================================

-- Enable UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  handicap NUMERIC(4,1),
  home_course TEXT,
  charity_id UUID,
  charity_percentage NUMERIC(5,2) DEFAULT 10 CHECK (charity_percentage >= 10),
  subscription_tier TEXT DEFAULT 'birdie' CHECK (subscription_tier IN ('birdie', 'eagle', 'albatross')),
  subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  draw_entries INTEGER DEFAULT 0,
  charity_total NUMERIC(12,2) DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Charities ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  website_url TEXT,
  total_raised NUMERIC(12,2) DEFAULT 0,
  supporter_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Subscriptions ──────────────────────────────────────────
CREATE TYPE subscription_tier AS ENUM ('birdie', 'eagle', 'albatross');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'birdie',
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─── Scores ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stableford_points INTEGER NOT NULL CHECK (stableford_points >= 1 AND stableford_points <= 45),
  course_name TEXT NOT NULL,
  date_played DATE NOT NULL DEFAULT CURRENT_DATE,
  gross_score INTEGER,
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Draws ──────────────────────────────────────────────────
CREATE TYPE draw_type AS ENUM ('random', 'algorithmic');
CREATE TYPE draw_status AS ENUM ('active', 'completed', 'canceled');

CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT 'Monthly Draw',
  description TEXT NOT NULL DEFAULT '',
  prize_description TEXT NOT NULL DEFAULT 'Cash Prize',
  draw_date DATE NOT NULL DEFAULT CURRENT_DATE,
  draw_type draw_type NOT NULL DEFAULT 'random',
  total_pool NUMERIC(12,2) NOT NULL DEFAULT 0,
  status draw_status NOT NULL DEFAULT 'active',
  winner_id UUID REFERENCES profiles(id),
  charity_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Draw Entries ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tickets INTEGER NOT NULL DEFAULT 1 CHECK (tickets > 0),
  locked_scores INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- ─── Winner Verifications ───────────────────────────────────
CREATE TYPE payment_state AS ENUM ('pending', 'paid', 'rejected');

CREATE TABLE IF NOT EXISTS winner_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proof_image_url TEXT NOT NULL,
  status payment_state NOT NULL DEFAULT 'pending',
  match_tier INTEGER NOT NULL CHECK (match_tier IN (3, 4, 5)),
  prize_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Draw Results (published numbers) ──────────────────────
CREATE TABLE IF NOT EXISTS draw_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL UNIQUE REFERENCES draws(id) ON DELETE CASCADE,
  draw_type draw_type NOT NULL DEFAULT 'random',
  winning_numbers INTEGER[] NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  simulated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT draw_results_numbers_count CHECK (array_length(winning_numbers, 1) = 5)
);

-- ─── Draw Winners (pending -> paid workflow) ───────────────
CREATE TABLE IF NOT EXISTS draw_winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_tier INTEGER NOT NULL CHECK (match_tier IN (3, 4, 5)),
  prize_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status payment_state NOT NULL DEFAULT 'pending',
  proof_image_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id, match_tier)
);

-- ─── Transactions ───────────────────────────────────────────
CREATE TYPE transaction_type AS ENUM ('subscription', 'draw_winnings', 'charity_donation');

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  type transaction_type NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FK from profiles → charities ──────────────────────────
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_charity
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL;

-- ─── Row Level Security ─────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_winners ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update their own
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Charities: everyone reads, admins manage
CREATE POLICY "Public charities" ON charities FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage charities" ON charities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Subscriptions: users see own
CREATE POLICY "Own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own sub" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- Scores: users see own, admins see all
CREATE POLICY "Own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "All scores for admins" ON scores FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Users insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own scores" ON scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own scores" ON scores FOR DELETE USING (auth.uid() = user_id);

-- Draws: everyone reads
CREATE POLICY "Public draws" ON draws FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage draws" ON draws FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Draw entries: users see own
CREATE POLICY "Own entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own entries insert" ON draw_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own entries delete" ON draw_entries FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins see all entries" ON draw_entries FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Winner verifications: users create/read own, admins manage all
CREATE POLICY "Own winner verification reads" ON winner_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own winner verification inserts" ON winner_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage winner verifications" ON winner_verifications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Draw results: everyone can read, admins manage
CREATE POLICY "Public draw results" ON draw_results FOR SELECT USING (TRUE);
CREATE POLICY "Admins manage draw results" ON draw_results FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Draw winners: users read/update own proof, admins manage all states
CREATE POLICY "Own draw winners read" ON draw_winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own draw winners update" ON draw_winners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage draw winners" ON draw_winners FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Transactions: users see own
CREATE POLICY "Own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins see all transactions" ON transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- ─── Auto-create profile on signup ──────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, charity_id, charity_percentage)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    CAST(NEW.raw_user_meta_data->>'charity_id' AS UUID),
    COALESCE(CAST(NEW.raw_user_meta_data->>'charity_percentage' AS NUMERIC), 10)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Seed charities ─────────────────────────────────────────
INSERT INTO charities (name, slug, description, logo_url, is_active) VALUES
  ('The First Tee', 'the-first-tee', 'Building game-changers by introducing young people to the game of golf and its values.', 'https://placehold.co/200x200/4f46e5/ffffff?text=TFT', TRUE),
  ('Golf Fore Africa', 'golf-fore-africa', 'Providing clean water and community development in sub-Saharan Africa through golf fundraising.', 'https://placehold.co/200x200/059669/ffffff?text=GFA', TRUE),
  ('Folds of Honor', 'folds-of-honor', 'Providing educational scholarships to the families of America''s fallen and disabled military service members.', 'https://placehold.co/200x200/dc2626/ffffff?text=FOH', TRUE),
  ('PGA REACH', 'pga-reach', 'Growing the game of golf with a focus on diversity, equity, and inclusion.', 'https://placehold.co/200x200/f59e0b/1e293b?text=PGA', TRUE),
  ('St. Jude Golfers', 'st-jude-golfers', 'Raising funds for St. Jude Children''s Research Hospital through golf events and donations.', 'https://placehold.co/200x200/818cf8/ffffff?text=SJG', TRUE)
ON CONFLICT DO NOTHING;
