interface CustomerDetails {
  name: string;
  email: string;
  address?: {
    country: string;
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

type PriceType = 'basic-monthly' | 'pro-monthly' | 'basic-yearly' | 'pro-yearly' | 'credit-pack';

const API_URL = import.meta.env.VITE_API_URL;

export const createCheckoutSession = async (
  priceType: string,
  userId: string,
  userEmail: string,
  customerDetails: CustomerDetails
) => {
  try {
    console.log('Creating checkout session with:', {
      priceType,
      userId,
      userEmail,
      customerDetails
    });

    const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceType,
        userId,
        userEmail,
        customerDetails,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Checkout session creation failed:', data);
      throw new Error(data.details || data.error || 'Failed to create checkout session');
    }

    console.log('Checkout session created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    throw error;
  }
};
