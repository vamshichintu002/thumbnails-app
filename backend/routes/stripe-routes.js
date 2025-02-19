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
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    console.log('Received checkout request:', req.body);
    const { priceType, userId, userEmail, customerDetails, couponId } = req.body;
    
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

    try {
      const session = await createCheckoutSession(
        priceType,
        userId,
        userEmail,
        customerDetails,
        couponId
      );

      console.log('Checkout session created:', session.id);
      res.json({ url: session.url });
    } catch (error) {
      if (error.message === 'Invalid coupon code') {
        return res.status(400).json({ error: 'Invalid or expired coupon code' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
    });
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
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
    // Verify the event with raw body
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    
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
