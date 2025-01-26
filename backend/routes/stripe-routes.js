import express from 'express';
import Stripe from 'stripe';
import { createCheckoutSession, handleWebhookEvent } from '../services/stripe-service.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceType, userId, userEmail } = req.body;
    
    if (!priceType || !userId || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        received: { priceType, userId, userEmail }
      });
    }

    console.log('Creating checkout session for:', { priceType, userId, userEmail });
    const session = await createCheckoutSession(priceType, userId, userEmail);
    console.log('Session created:', session.id);
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error in create-checkout-session route:', error);
    // Send more detailed error message in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Failed to create checkout session';
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await handleWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
