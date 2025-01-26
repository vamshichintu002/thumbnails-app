import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Define subscription credits
const SUBSCRIPTION_CREDITS = {
  'basic-monthly': 250,
  'basic-yearly': 3000,
  'pro-monthly': 1000,
  'pro-yearly': 12000
};

export const handleSuccessfulPayment = async (event) => {
  const session = event.data.object;
  
  console.log('💳 Raw session data:', JSON.stringify(session, null, 2));
  
  // Extract data with fallbacks
  const profileId = session.client_reference_id;
  const metadata = session.metadata || {};
  const priceType = metadata.priceType || 'basic-monthly';
  const customerEmail = session.customer_email || metadata.userEmail;
  
  console.log('Processing payment:', {
    profileId,
    metadata,
    priceType,
    customerEmail
  });
  
  try {
    // Check if profile exists and verify user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      throw profileError;
    }

    // Verify that the email matches
    if (profile.email !== customerEmail) {
      const error = new Error('Email mismatch: Payment email does not match profile email');
      console.error('❌ Authentication Error:', error.message);
      throw error;
    }

    console.log('✅ User verified:', {
      profileId: profile.id,
      email: profile.email
    });

    // Record the payment
    const paymentData = {
      profile_id: profileId,
      stripe_payment_id: session.id,
      amount: (session.amount_total || 1000) / 100,
      currency: session.currency || 'usd',
      payment_status: 'completed',
      payment_type: 'subscription',
      credits_added: SUBSCRIPTION_CREDITS[priceType] || 250
    };

    console.log('💾 Inserting payment record:', paymentData);
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([paymentData]);

    if (paymentError) {
      console.error('❌ Error recording payment:', paymentError);
      throw paymentError;
    }
    console.log('✅ Successfully recorded payment');

    // Always handle as subscription for testing
    console.log('📅 Processing subscription');
    const duration = priceType.includes('monthly') ? 30 : 365;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const subscriptionData = {
      profile_id: profileId,
      subscription_type: priceType,
      stripe_subscription_id: session.subscription || session.id,
      subscription_start_date: startDate.toISOString(),
      subscription_end_date: endDate.toISOString(),
      subscription_status: 'active',
      credits: SUBSCRIPTION_CREDITS[priceType] || 250,
      updated_at: new Date().toISOString()
    };
    console.log('💾 Upserting subscription:', subscriptionData);

    // Update or insert subscription
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert([subscriptionData]);

    if (subError) {
      console.error('❌ Error updating subscription:', subError);
      throw subError;
    }
    console.log('✅ Successfully updated subscription');

    // Update profile credits
    const creditsToAdd = SUBSCRIPTION_CREDITS[priceType] || 250;
    console.log('💳 Updating profile credits:', { profileId, creditsToAdd });
    
    const { error: creditError } = await supabase
      .from('profiles')
      .update({ 
        credits: profile.credits + creditsToAdd,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (creditError) {
      console.error('❌ Error updating profile credits:', creditError);
      throw creditError;
    }
    console.log('✅ Successfully updated profile credits');

    console.log(`✨ Successfully processed payment for profile ${profileId}`);
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    throw error;
  }
};

export const handleSubscriptionUpdated = async (event) => {
  // Implementation for subscription updates
  console.log('Subscription updated:', event.data.object);
};

export const handleSubscriptionCanceled = async (event) => {
  // Implementation for subscription cancellations
  console.log('Subscription canceled:', event.data.object);
};
