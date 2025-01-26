import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { priceId, isYearly } = req.body;
    
    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
      customer: req.user?.stripeCustomerId, // If user already has a Stripe customer ID
      subscription_data: {
        trial_period_days: 7, // Optional: Add a trial period
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const createPaymentLink = async (req, res) => {
  try {
    const { planType, isYearly } = req.body;
    
    // Map plan types to Stripe price IDs
    const priceIds = {
      BASIC: {
        monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
      },
      PRO: {
        monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
      },
      CREDIT_PACKS: {
        oneTime: process.env.STRIPE_CREDIT_PACK_PRICE_ID,
      },
    };

    const priceId = planType === 'CREDIT_PACKS' 
      ? priceIds.CREDIT_PACKS.oneTime
      : isYearly 
        ? priceIds[planType].yearly 
        : priceIds[planType].monthly;

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.FRONTEND_URL}/dashboard`,
        },
      },
    });

    res.json({ url: paymentLink.url });
  } catch (error) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Add credits or update subscription status in your database
      await handleSuccessfulPayment(session);
      break;
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      // Handle subscription updates
      await handleSubscriptionUpdate(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Helper functions
async function handleSuccessfulPayment(session) {
  // Implement your logic to update user credits or subscription status
  // This will depend on your database schema and business logic
}

async function handleSubscriptionUpdate(subscription) {
  // Implement your logic to handle subscription updates
  // This will depend on your database schema and business logic
}

export { handleSuccessfulPayment, handleSubscriptionUpdate };
