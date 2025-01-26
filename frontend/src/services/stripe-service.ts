interface CheckoutResponse {
  sessionId: string;
  url: string;
}

type PriceType = 'basic-monthly' | 'pro-monthly' | 'basic-yearly' | 'pro-yearly' | 'credit-pack';

export const createCheckoutSession = async (
  priceType: string,
  userId: string,
  userEmail: string
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceType,
          userId,
          userEmail
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};
