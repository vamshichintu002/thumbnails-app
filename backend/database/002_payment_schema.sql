-- Update subscriptions table
ALTER TABLE subscriptions
ADD COLUMN subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN subscription_type TEXT; -- 'basic-monthly', 'pro-monthly', 'basic-yearly', 'pro-yearly'

-- Create payments table if not exists
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_payment_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    payment_type TEXT NOT NULL, -- 'subscription' or 'credit-pack'
    credits_added INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to handle subscription payment
CREATE OR REPLACE FUNCTION handle_subscription_payment(
    p_profile_id UUID,
    p_subscription_type TEXT,
    p_stripe_subscription_id TEXT,
    p_credits INTEGER
) RETURNS void AS $$
DECLARE
    subscription_duration INTERVAL;
BEGIN
    -- Set subscription duration based on type
    IF p_subscription_type LIKE '%-monthly' THEN
        subscription_duration := INTERVAL '30 days';
    ELSE
        subscription_duration := INTERVAL '1 year';
    END IF;

    -- Update or insert subscription
    INSERT INTO subscriptions (
        profile_id,
        subscription_type,
        stripe_subscription_id,
        subscription_start_date,
        subscription_end_date,
        subscription_status,
        credits
    )
    VALUES (
        p_profile_id,
        p_subscription_type,
        p_stripe_subscription_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + subscription_duration,
        'active',
        p_credits
    )
    ON CONFLICT (profile_id) DO UPDATE
    SET
        subscription_type = EXCLUDED.subscription_type,
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        subscription_start_date = EXCLUDED.subscription_start_date,
        subscription_end_date = EXCLUDED.subscription_end_date,
        subscription_status = EXCLUDED.subscription_status,
        credits = EXCLUDED.credits;
END;
$$ LANGUAGE plpgsql;

-- Function to handle credit pack payment
CREATE OR REPLACE FUNCTION handle_credit_pack_payment(
    p_profile_id UUID,
    p_credits INTEGER
) RETURNS void AS $$
BEGIN
    -- Update user credits (add to existing credits)
    UPDATE subscriptions
    SET credits = COALESCE(credits, 0) + p_credits
    WHERE profile_id = p_profile_id;
    
    -- If no subscription exists, create one for credits only
    IF NOT FOUND THEN
        INSERT INTO subscriptions (profile_id, credits)
        VALUES (p_profile_id, p_credits);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to expire subscriptions and reset credits
CREATE OR REPLACE FUNCTION expire_subscriptions() RETURNS void AS $$
BEGIN
    UPDATE subscriptions
    SET 
        credits = 0,
        subscription_status = 'expired'
    WHERE 
        subscription_end_date < CURRENT_TIMESTAMP
        AND subscription_status = 'active'
        AND subscription_type IS NOT NULL; -- Don't expire credit pack users
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically expire subscriptions
CREATE OR REPLACE FUNCTION check_subscription_expiry() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_end_date < CURRENT_TIMESTAMP AND NEW.subscription_status = 'active' THEN
        NEW.subscription_status := 'expired';
        NEW.credits := 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_expiry_trigger
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION check_subscription_expiry();

-- Create an index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(subscription_status);
CREATE INDEX IF NOT EXISTS idx_payments_profile_id ON payments(profile_id);
