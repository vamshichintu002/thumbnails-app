import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

if (!process.env.FRONTEND_URL) {
  throw new Error('Missing FRONTEND_URL environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  'basic-monthly': { 
    credits: 250,
    priceId: process.env.STRIPE_PRICE_BASIC_MONTHLY,
    isSubscription: true
  },
  'pro-monthly': { 
    credits: 500,
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    isSubscription: true
  },
  'basic-yearly': { 
    credits: 3000,
    priceId: process.env.STRIPE_PRICE_BASIC_YEARLY,
    isSubscription: true
  },
  'pro-yearly': { 
    credits: 6000,
    priceId: process.env.STRIPE_PRICE_PRO_YEARLY,
    isSubscription: true
  },
  'credit-pack': { 
    credits: 250,
    priceId: process.env.STRIPE_PRICE_CREDIT_PACK,
    isSubscription: false
  }
};

export const createCheckoutSession = async (priceType, userId, userEmail, customerDetails, couponId = null) => {
  try {
    console.log('Starting checkout session creation with:', { priceType, userId, userEmail, couponId });
    
    if (!PRICE_IDS[priceType]) {
      console.error('Invalid price type:', priceType);
      throw new Error(`Invalid price type: ${priceType}`);
    }

    if (!PRICE_IDS[priceType].priceId) {
      console.error('Missing price ID for type:', priceType);
      throw new Error(`Missing price ID for type ${priceType}`);
    }

    console.log('Using price configuration:', {
      priceType,
      priceId: PRICE_IDS[priceType].priceId,
      isSubscription: PRICE_IDS[priceType].isSubscription
    });

    const frontendUrl = process.env.FRONTEND_URL.trim();
    if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
      throw new Error('FRONTEND_URL must start with http:// or https://');
    }

    // Validate coupon if provided
    if (couponId) {
      try {
        const coupon = await stripe.coupons.retrieve(couponId);
        if (!coupon.valid) {
          throw new Error('Invalid or expired coupon');
        }
      } catch (error) {
        console.error('Error validating coupon:', error);
        throw new Error('Invalid coupon code');
      }
    }

    const baseSessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[priceType].priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/dashboard`,
      client_reference_id: userId,
      customer_email: userEmail,
      metadata: {
        credits: PRICE_IDS[priceType].credits,
        userId: userId,
        priceType: priceType
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true, // Enable promotion code field in checkout
    };

    // Add coupon if provided
    if (couponId) {
      baseSessionConfig.discounts = [{
        coupon: couponId,
      }];
    }

    const sessionConfig = PRICE_IDS[priceType].isSubscription 
      ? {
          ...baseSessionConfig,
          mode: 'subscription',
          subscription_data: {
            metadata: {
              credits: PRICE_IDS[priceType].credits,
              userId: userId,
              priceType: priceType
            }
          }
        }
      : {
          ...baseSessionConfig,
          mode: 'payment'
        };

    console.log('Creating session with config:', JSON.stringify(sessionConfig, null, 2));
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log('Checkout session created:', session.id);
    return session;
  } catch (error) {
    console.error('Detailed error in createCheckoutSession:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      raw: error.raw ? {
        message: error.raw.message,
        type: error.raw.type,
        param: error.raw.param
      } : null
    });
    throw error;
  }
};

export const handleWebhookEvent = async (event) => {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Here you would update the user's credits in your database
        const { userId, credits } = session.metadata;
        // TODO: Implement the credit update logic using your database
        // Example: await updateUserCredits(userId, parseInt(credits));
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscription = invoice.subscription;
        const { userId, credits } = invoice.subscription.metadata;
        // TODO: Add credits to user's account on each successful payment
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // TODO: Handle subscription cancellation
        break;
      }
      // Add other webhook events as needed
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
};
