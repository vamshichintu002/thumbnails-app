Below is a **comprehensive instruction file** from the **DB Administrator** viewpoint. It details the schema design, how each table is used, how they link together, and examples of how the backend team can interact with the data. The goal is to ensure a smooth integration between your Supabase database and the backend logic.

---

## Overview

We have:
1. **Supabase Auth** (the `auth.users` table) for managing user authentication.
2. A **profiles** table to store additional user info like credits and referral codes (1:1 with `auth.users`).
3. Several related tables to handle:
   - **Generation types** (e.g., “text_to_thumbnail”).
   - **Generations** (records each thumbnail generation event).
   - **User images** (storing uploaded face photos).
   - **Subscriptions** (if the user is on a recurring plan).
   - **Payments** (one‐time credit purchases or logs of completed Stripe transactions).

**Important Note**: In Supabase, `auth.users` is automatically managed by the authentication system. We simply reference `auth.users.id` in our `profiles` table to maintain each user’s credits, referrals, etc.

---

## Schema Definition

Below is the **SQL schema** that you should run in your Supabase project. It creates/updates the necessary tables.

```sql
------------------------------------------------------------------------------
-- 1) PROFILES TABLE (1:1 with auth.users)
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
```

### Relationships Recap

- **`auth.users`** → Has the user’s login credentials, email, etc. (Supabase-managed).  
- **`profiles.id`** → Identical to `auth.users.id`. On user creation, we must manually create a `profiles` row.  
- **`generation_types`** → Static list of generation modes (6 total).  
- **`generations`** → Tracks a single generation event. A foreign key to `profiles` indicates **who** generated it. Another FK to `generation_types.type_key` indicates **which** mode.  
- **`user_images`** → All images the user has uploaded. Each record belongs to a single `profiles` row.  
- **`subscriptions`** → If a user is on a recurring plan, we store it here. `plan_name` is your custom string, `is_active` tracks if it’s live.  
- **`payments`** → One‐time or subscription payment records. We log the amount, optional Stripe payment ID, and how many credits are added.

---

## How to Use Each Table

### 1) Profiles

- **Creation**: After a user signs up with Supabase Auth, the backend should **insert** a row into `profiles` using `auth.users.id` for the `profiles.id`.  
- **Credits**: The main integer we’ll increment/decrement whenever the user gains or spends credits.  
- **Referrals**: 
  - `referral_code`: A unique code this user can share.  
  - `referred_by`: The code of the user who referred them (if any).

**Example**: Creating a new profile when a user signs up:
```sql
INSERT INTO profiles (id, credits, referral_code)
VALUES (
  '11111111-1111-1111-1111-111111111111',  -- from auth.users
  50,                                      -- initial free credits
  'REFCODEABC'
);
```

### 2) Generation Types

- Static list that you populate once with 6 records:
  - `text_to_thumbnail` (10 credits)
  - `youtube_thumbnail` (20 credits)
  - `your_face` (20 credits)
  - `face_youtube` (20 credits)
  - `top_youtube_style` (20 credits)
  - `top_youtube_style_face` (20 credits)

**Example**: Inserting or updating a generation type:
```sql
INSERT INTO generation_types (type_key, display_name, cost_credits)
VALUES ('text_to_thumbnail','Text to Thumbnail',10)
ON CONFLICT (type_key) DO UPDATE
SET display_name = EXCLUDED.display_name,
    cost_credits = EXCLUDED.cost_credits;
```
(This ensures you can dynamically change credit costs or display names.)

### 3) Generations

- Every time a user generates a thumbnail, insert a row:
  - `profile_id`: Which user?  
  - `generation_type`: e.g., `'text_to_thumbnail'`.  
  - `output_image_url`: Final image URL from your AI pipeline.  
  - `credit_cost`: How many credits were spent (should match `generation_types.cost_credits`).

**Example**: Logging a generation event:
```sql
INSERT INTO generations (profile_id, generation_type, output_image_url, credit_cost)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'text_to_thumbnail',
  'https://bucket-url/public/generated/thumbnail123.png',
  10
);

-- Then decrement the user's credits:
UPDATE profiles
SET credits = credits - 10
WHERE id = '11111111-1111-1111-1111-111111111111';
```

### 4) User Images

- Store user‐uploaded face photos.  
- Each image belongs to one profile.  
- `image_url`: The path or fully qualified URL to the uploaded file (e.g., in Supabase Storage).

**Example**:  
```sql
INSERT INTO user_images (profile_id, image_url)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'https://bucket-url/public/faces/user-face1.png'
);
```

### 5) Subscriptions

- When a user purchases a recurring subscription, we **insert** or **update** a record:
  - `plan_name`: e.g., `'monthly_25images'`.  
  - `is_active`, `start_date`, and `end_date` can help you track if the subscription is still valid.  

**Example**: Adding a subscription:
```sql
INSERT INTO subscriptions (profile_id, plan_name, is_active, start_date, end_date)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'monthly_25images',
  true,
  now(),
  now() + interval '1 month'
);
```

If the user renews or changes plans, you can `UPDATE` this record or insert a new one with different dates.

### 6) Payments

- **One‐time** or **subscription** payments get recorded here:
  - `stripe_payment_id`: So you can reconcile with Stripe.  
  - `amount`: How much the user paid.  
  - `credits_added`: If it’s a one‐time purchase that grants credits, store the number of credits in this column.

**Example**:
```sql
INSERT INTO payments (profile_id, stripe_payment_id, amount, credits_added)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'pi_12345_stripe',
  10.00,
  250
);

-- Then update the profile’s credits:
UPDATE profiles
SET credits = credits + 250
WHERE id = '11111111-1111-1111-1111-111111111111';
```

---

## End-to-End Workflow (Example)

1. **User signs up** (Supabase Auth) → we get `auth.users.id = U1`.  
2. **Create a profile** row using that `id`:
   ```sql
   INSERT INTO profiles (id, credits, referral_code) VALUES (U1, 50, 'REF123');
   ```
3. **Referral**: If user typed a referral code, find who owns it:
   ```sql
   UPDATE profiles
   SET credits = credits + 30
   WHERE referral_code = 'REF123';
   ```
   And store `referred_by = 'REF123'` in the new user’s profile if needed.
4. **User uploads a face** → insert into `user_images`.  
5. **User generates** a thumbnail (pick generation type). Suppose it’s `'text_to_thumbnail'` costing 10 credits.  
   ```sql
   INSERT INTO generations (profile_id, generation_type, output_image_url, credit_cost)
   VALUES (U1, 'text_to_thumbnail', 'URL_OF_AI_OUTPUT', 10);

   UPDATE profiles
   SET credits = credits - 10
   WHERE id = U1;
   ```
6. **User runs out of credits** → buys a credit pack or subscription.  
   - One‐time pack:
     ```sql
     INSERT INTO payments (profile_id, stripe_payment_id, amount, credits_added)
     VALUES (U1, 'pi_12345', 20.00, 500);

     UPDATE profiles
     SET credits = credits + 500
     WHERE id = U1;
     ```
   - Subscription purchase:
     ```sql
     INSERT INTO payments (profile_id, stripe_payment_id, amount, credits_added)
     VALUES (U1, 'pi_subscription_67890', 15.00, 0);

     INSERT INTO subscriptions (profile_id, plan_name, is_active, start_date, end_date)
     VALUES (U1, 'monthly_25images', true, now(), now() + interval '1 month');
     ```
   - (Optionally) Add credits for subscription:
     ```sql
     UPDATE profiles
     SET credits = credits + 250
     WHERE id = U1;
     ```

---

## Additional Notes & Best Practices

1. **Data Consistency**  
   - Always verify the user’s credits on the server side before generating a thumbnail. Don’t rely only on the frontend.  

2. **Unique Constraints**  
   - `profiles.referral_code` is unique, so generate random strings or short UUIDs.  

3. **Referential Integrity**  
   - `ON DELETE CASCADE` ensures that if a user is removed from `auth.users`, their `profiles` entry (and related data) also gets removed.  

4. **Indexing**  
   - By default, the primary keys are indexed.  
   - If you query `profiles` often by `referral_code`, consider adding an index to `referral_code`.  

5. **Stripe Webhooks**  
   - When you receive a webhook from Stripe for successful payment, call the relevant **INSERT** or **UPDATE** statements in `payments`, `subscriptions`, and `profiles` as needed.  

6. **Security & Row-Level Policies (RLS)**  
   - In a production environment, set up [Supabase Row-Level Security (RLS)](https://supabase.com/docs/guides/auth#row-level-security) to ensure that users can only update their own records.  

---

## Conclusion

With this schema and the outlined queries:

- You can track **profile** data for each authenticated user.  
- You have a **clear record** of every thumbnail generation (who did it, how many credits it cost).  
- You handle **referrals** (by awarding extra credits to the referrer).  
- You keep a log of **payments** (both subscription and one‐time) and adjust user credits accordingly.  
- You manage **subscriptions** for recurring credit additions or unlimited usage within a period.

This document should serve as your comprehensive reference for integrating the database layer into your backend code. If you have any questions about specific queries or advanced usage (like RLS or triggers), feel free to reach out.