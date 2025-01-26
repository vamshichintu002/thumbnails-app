import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test profile ID from our database
const TEST_PROFILE_ID = 'b6888d1c-eea9-4c30-9d65-973b3ff49c61';

async function createTestCheckoutSession() {
  try {
    // First, get the user's email from the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', TEST_PROFILE_ID)
      .single();

    if (profileError) throw profileError;

    // Create a test product if it doesn't exist
    const product = await stripe.products.create({
      name: 'Test Subscription',
    });

    // Create a test price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 1000, // $10.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    // Create checkout session with customer information
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: price.id,
        quantity: 1,
      }],
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/cancel',
      client_reference_id: TEST_PROFILE_ID,
      customer_email: profile.email, // Add customer email
      metadata: {
        priceType: 'basic-monthly',
        userId: TEST_PROFILE_ID,
        userEmail: profile.email,
        userName: profile.full_name
      }
    });

    console.log('Checkout session created!');
    console.log('Session ID:', session.id);
    console.log('Checkout URL:', session.url);
    console.log('\nCustomer Details:');
    console.log('Email:', profile.email);
    console.log('User ID:', TEST_PROFILE_ID);
    
    // For testing, we'll trigger a test webhook event
    console.log('\nTo test the webhook:');
    console.log('1. Copy the Session ID above');
    console.log('2. Run this command in a new terminal:');
    console.log(`stripe trigger checkout.session.completed --add checkout_session:${session.id}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestCheckoutSession(); 