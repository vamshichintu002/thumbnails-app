import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Basic Monthly Subscription',
          },
          unit_amount: 1000,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      }],
      client_reference_id: '2185c5e2-e915-4dad-856b-59f39241da76',
      metadata: {
        priceType: 'basic-monthly'
      },
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });

    console.log('Checkout session created:', session);
  } catch (error) {
    console.error('Error:', error);
  }
}

createCheckoutSession();
