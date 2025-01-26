interface CheckoutResponse {
  sessionId: string;
  url: string;
}

type PriceType = 'basic-monthly' | 'pro-monthly' | 'basic-yearly' | 'pro-yearly' | 'credit-pack';

export const createCheckoutSession = async (priceType: PriceType, userId: string): Promise<CheckoutResponse> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceType, userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
};
