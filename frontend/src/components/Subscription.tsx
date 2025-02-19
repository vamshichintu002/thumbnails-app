import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Image, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { createCheckoutSession } from '../services/stripe-service';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { formatDate } from '../utils/date-utils';
import { Button } from '../components/ui/button';

interface SubscriptionProps {
  onUpgrade: () => void;
}

interface Plan {
  name: string;
  description: string;
  price?: string;
  yearlyPrice?: string;
  monthlyPrice?: string;
  period: string;
  yearlyPeriod: string;
  credits: string;
  features: string[];
  buttonText: string;
  priceType: (isYearly: boolean) => string;
  isPopular: boolean;
}

interface SubscriptionData {
  credits: number;
  subscription_type: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_status: string | null;
}

const plans: Plan[] = [
  {
    name: "BASIC",
    price: "15",
    yearlyPrice: "10",
    period: "per month",
    yearlyPeriod: "per month",
    credits: "250 credits",
    features: [
      "Up to 25 images per month",
      "Text to thumbnail",
      "Generate thumbnail from YouTube",
      "Generate thumbnail using your face",
      "Generate thumbnail with face and YouTube image reference",
      "Thumbnail enhancer",
      "All generations stay private",
    ],
    description: "Perfect for content creators getting started",
    buttonText: "Get Started",
    priceType: (isYearly: boolean) => isYearly ? 'basic-yearly' : 'basic-monthly',
    isPopular: false,
  },
  {
    name: "PRO",
    price: "25",
    yearlyPrice: "20",
    period: "per month",
    yearlyPeriod: "per month",
    credits: "500 credits",
    features: [
      "Up to 50 images per month",
      "Access to all models",
      "Text to thumbnail",
      "Generate thumbnail from YouTube",
      "Generate thumbnail using your face",
      "Generate thumbnail with face and YouTube image reference",
      "Thumbnail enhancer",
      "Generate TOP YouTuber channels style thumbnail",
      "Generate TOP YouTuber channels style with your face",
      "All generations stay private",
    ],
    description: "Best for professional content creators",
    buttonText: "Get Started",
    priceType: (isYearly: boolean) => isYearly ? 'pro-yearly' : 'pro-monthly',
    isPopular: true,
  },
  
];

const SubscriptionStatus: React.FC<{
  credits: number;
  subscriptionData?: SubscriptionData;
  onPurchaseCredits: (plan: Plan) => void;
}> = ({ credits, subscriptionData, onPurchaseCredits }) => {
  if (!subscriptionData || subscriptionData.subscription_status !== 'active') {
    return null;
  }

  const isLowCredits = credits < 50;
  const startDate = subscriptionData.subscription_start_date ? new Date(subscriptionData.subscription_start_date) : new Date();
  const endDate = subscriptionData.subscription_end_date ? new Date(subscriptionData.subscription_end_date) : new Date();
  
  const planType = subscriptionData.subscription_type?.split('-')[0] || 'Basic';
  const billingCycle = subscriptionData.subscription_type?.split('-')[1] || 'Monthly';
  const maxCredits = planType.toLowerCase() === 'basic' ? 250 : 500;

  const creditPack: Plan = {
    name: 'Credit Pack',
    price: '10',
    yearlyPrice: '10',
    period: 'one-time',
    yearlyPeriod: 'one-time',
    credits: '250 credits',
    features: [],
    description: 'Additional credits when you need them',
    buttonText: 'Buy Credits',
    priceType: (_isYearly: boolean) => 'credit-pack',
    isPopular: false,
  };

  return (
    <div className="relative rounded-2xl border border-white/10 bg-card p-8 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-white mb-8">Current Subscription</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white/80 mb-2">Plan Details</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-white/80">{planType} Plan ({billingCycle})</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white/80 mb-2">Billing Period</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Image className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white/80">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white/80 mb-2">Credits</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Image className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isLowCredits 
                        ? "bg-gradient-to-r from-red-500 to-red-400" 
                        : "bg-gradient-to-r from-green-500 to-green-400"
                    )}
                    style={{ width: `${(credits / maxCredits) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-white/80">{credits} credits remaining</p>
              </div>
            </div>
          </div>
          
          {isLowCredits && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 mb-8 md:mb-16">
              <p className="text-red-400 text-sm mb-3">
                Your credits are running low! Consider purchasing a credit pack to ensure uninterrupted service.
              </p>
              <button
                onClick={() => onPurchaseCredits(creditPack)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                  "bg-red-500 text-white hover:bg-red-600 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background"
                )}
              >
                Purchase Credits
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Subscription: React.FC<SubscriptionProps> = ({
  onUpgrade,
}) => {
  const [isYearly, setIsYearly] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user?.id) return;

      try {
        // First get the profile data to get the current credits
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('credits, full_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        // Then get the subscription data
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('subscription_type, subscription_start_date, subscription_end_date, subscription_status')
          .eq('profile_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle no subscription case

        // If there's no subscription, that's okay - just use profile data
        if (subError && subError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subError);
          return;
        }

        // Create subscription data object
        const subscriptionData: SubscriptionData = {
          credits: profileData.credits,
          subscription_type: subData?.subscription_type || null,
          subscription_start_date: subData?.subscription_start_date || null,
          subscription_end_date: subData?.subscription_end_date || null,
          subscription_status: subData?.subscription_status || 'inactive'
        };

        setSubscriptionData(subscriptionData);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      }
    };

    fetchSubscriptionData();
  }, [user?.id]);

  const handleCheckout = async (plan: Plan) => {
    if (!user?.id || !user?.email) {
      console.error('User not authenticated or missing email');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      const priceType = plan.priceType(isYearly);
      
      // Get user details from Supabase profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch user profile');
      }

      const customerDetails = {
        name: profileData.full_name || user.email.split('@')[0],
        email: user.email,
        address: {
          country: 'IN', // Default to India
          line1: '', // Will be collected by Stripe Checkout
          city: '',
          state: '',
          postal_code: ''
        }
      };

      const { url } = await createCheckoutSession(
        priceType, 
        user.id, 
        user.email,
        customerDetails
      );

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      setError(error instanceof Error ? error.message : 'Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  // If user has an active subscription, only show the current subscription details
  if (subscriptionData?.subscription_status === 'active') {
    return (
      <div className="py-8">
        <SubscriptionStatus 
          credits={subscriptionData.credits} 
          subscriptionData={subscriptionData} 
          onPurchaseCredits={handleCheckout}
        />
        
        {/* Credit Pack Purchase Option */}
        <div className="mt-8 p-6 border rounded-lg bg-card">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-16 md:mb-24">
              <h3 className="text-xl md:text-2xl font-bold mb-4">Need More Credits?</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">Credit Pack</p>
                  <p className="text-muted-foreground">Get 250 additional credits</p>
                  <p className="text-2xl font-bold mt-2">$10.00</p>
                </div>
                <Button
                  onClick={() => handleCheckout({ 
                    name: 'Credit Pack',
                    description: '250 additional credits',
                    priceType: (isYearly: boolean) => 'credit-pack',
                    monthlyPrice: '10.00',
                    yearlyPrice: '10.00',
                    credits: '250',
                    features: ['One-time purchase', 'Added to your current balance', 'Never expires'],
                    isPopular: false,
                    period: 'one-time',
                    yearlyPeriod: 'one-time',
                    buttonText: 'Buy Credits'
                  })}
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buy Credits'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no active subscription, show the subscription plans
  return (
    <div className="py-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">My Subscription</h2>
        <p className="text-white/60">
          Choose the plan that best fits your needs
        </p>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-start items-center gap-3 mb-8">
        <span className={cn(
          "text-sm font-medium transition-colors",
          !isYearly ? "text-foreground" : "text-muted-foreground"
        )}>
          Monthly
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            "bg-blue-600 focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              isYearly ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
        <span className={cn(
          "text-sm font-medium transition-colors",
          isYearly ? "text-foreground" : "text-muted-foreground"
        )}>
          Yearly <span className="text-blue-400">(Save 20%)</span>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative rounded-2xl border p-8",
              "bg-card text-card-foreground shadow-sm transition-all duration-200",
              plan.isPopular ? "border-blue-600 scale-105" : "border-white/10 hover:border-white/20",
              "flex flex-col justify-between"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-4 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                Most Popular
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-white/60">
                  {plan.description}
                </p>
              </div>

              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${isYearly ? plan.yearlyPrice : plan.price}
                </span>
                <span className="text-white/60 ml-2">
                  /{isYearly ? plan.yearlyPeriod : plan.period}
                </span>
              </div>

              <div className="py-4">
                <p className="text-sm font-medium text-white/80 mb-4">Plan Includes:</p>
                <ul className="space-y-3 text-sm leading-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => handleCheckout(plan)}
              disabled={isLoading}
              className={cn(
                "w-full rounded-lg px-6 py-3 text-sm font-medium mt-6",
                "bg-blue-600 text-white shadow-lg",
                "hover:bg-blue-700 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              {isLoading ? 'Processing...' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
