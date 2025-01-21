------------------------------------------------------------------------------
-- 1) PROFILES TABLE (1:1 with auth.users)
------------------------------------------------------------------------------

------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  credits INT NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE profiles IS 'User profile data (credits, referrals), references auth.users.id 1:1.';


------------------------------------------------------------------------------
-- 2) GENERATION_TYPES TABLE
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS generation_types (
  type_key TEXT PRIMARY KEY,  -- e.g. 'text_to_thumbnail'
  display_name TEXT,
  cost_credits INT NOT NULL
);

COMMENT ON TABLE generation_types IS 'Defines each generation mode and how many credits it costs.';


------------------------------------------------------------------------------
-- 3) GENERATIONS TABLE
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL REFERENCES generation_types (type_key),
  output_image_url TEXT,
  credit_cost INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE generations IS 'Each record is a thumbnail generation, logs user, type, cost, result URL.';


------------------------------------------------------------------------------
-- 4) USER_IMAGES TABLE
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE user_images IS 'Stores user-uploaded images (face photos).';


------------------------------------------------------------------------------
-- 5) SUBSCRIPTIONS TABLE
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,           -- e.g. 'monthly_25images'
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE subscriptions IS 'Tracks recurring subscription plans for each user profile.';


------------------------------------------------------------------------------
-- 6) PAYMENTS TABLE
------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  credits_added INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE payments IS 'Records payment logs (Stripe, etc.) and how many credits were granted.';