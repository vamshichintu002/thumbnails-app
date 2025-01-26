import express from 'express';
import Stripe from 'stripe';
import { createCheckoutSession } from '../services/stripe-service.js';
import { 
  handleSuccessfulPayment, 
  handleSubscriptionUpdated, 
  handleSubscriptionCanceled 
} from '../services/webhook-handlers.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    console.log('Received checkout request:', req.body);
    const { priceType, userId, userEmail, customerDetails } = req.body;
    
    if (!priceType || !userId || !userEmail || !customerDetails?.name) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        received: { priceType, userId, userEmail, customerDetails }
      });
    }

    // Get the correct price ID based on the priceType
    let priceId;
    switch (priceType) {
      case 'basic-monthly':
        priceId = process.env.STRIPE_PRICE_BASIC_MONTHLY;
        break;
      case 'basic-yearly':
        priceId = process.env.STRIPE_PRICE_BASIC_YEARLY;
        break;
      case 'pro-monthly':
        priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
        break;
      case 'pro-yearly':
        priceId = process.env.STRIPE_PRICE_PRO_YEARLY;
        break;
      case 'credit-pack':
        priceId = process.env.STRIPE_PRICE_CREDIT_PACK;
        break;
      default:
        return res.status(400).json({ error: 'Invalid price type' });
    }

    // Verify that we have the price ID
    if (!priceId) {
      console.error('Missing price ID for type:', priceType);
      return res.status(500).json({ 
        error: 'Price ID not configured',
        details: `Price ID for ${priceType} is not set in environment variables`
      });
    }

    console.log('Using price ID:', priceId);

    // Create checkout session with customer details
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: priceType === 'credit-pack' ? 'payment' : 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: userId,
      customer_email: userEmail,
      metadata: {
        priceType,
        userId,
        userEmail
      },
      billing_address_collection: 'required'
    };

    // Only add customer_creation for payment mode
    if (priceType === 'credit-pack') {
      sessionConfig.customer_creation = 'always';
    }

    console.log('Creating checkout session with config:', JSON.stringify(sessionConfig, null, 2));

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Checkout session created:', session.id);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message,
      code: error.code,
      type: error.type
    });
  }
});

// This must be before all other middleware for the webhook route
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe webhook handler
router.post('/webhook', async (req, res) => {
  console.log('🔔 Webhook received!');
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    console.error('❌ No Stripe signature found in headers');
    return res.status(400).send('No Stripe signature found');
  }

  if (!endpointSecret) {
    console.error('❌ No webhook secret configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;

  try {
    // Get the raw body buffer
    const payload = req.body;
    console.log('Webhook secret:', endpointSecret);
    console.log('Signature:', sig);
    
    // Verify the event
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      endpointSecret
    );
    
    console.log('✅ Webhook verified! Event type:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2));

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💰 Processing checkout session...');
        await handleSuccessfulPayment(event);
        break;
      case 'customer.subscription.updated':
        console.log('🔄 Processing subscription update...');
        await handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        console.log('❌ Processing subscription cancellation...');
        await handleSubscriptionCanceled(event);
        break;
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({received: true});
  } catch (err) {
    console.error('❌ Webhook Error:', err.message);
    console.error('Error details:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
