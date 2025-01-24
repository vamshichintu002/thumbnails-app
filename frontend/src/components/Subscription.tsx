import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Image } from 'lucide-react';
import { cn } from '../lib/utils';

interface SubscriptionProps {
  credits: number;
  isLoadingCredits: boolean;
  onUpgrade: () => void;
}

const plans = [
  {
    name: "BASIC",
    price: "15",
    yearlyPrice: "10",
    period: "per month",
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
    href: "#",
    isPopular: false,
  },
  {
    name: "PRO",
    price: "25",
    yearlyPrice: "20",
    period: "per month",
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
    href: "#",
    isPopular: true,
  },
  {
    name: "CREDIT PACKS",
    price: "10",
    yearlyPrice: "10",
    period: "one-time",
    credits: "250 credits",
    features: [
      "Purchase only credits after exhausting monthly credits",
      "10$ = 250 credits",
      "20$ = 500 credits",
      "Use anytime",
      "Never expires",
    ],
    description: "Additional credits when you need them",
    buttonText: "Buy Credits",
    href: "#",
    isPopular: false,
  },
];

export const Subscription: React.FC<SubscriptionProps> = ({
  credits,
  isLoadingCredits,
  onUpgrade,
}) => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">My Subscription</h2>
        <p className="text-white/60">
          Choose the plan that best fits your needs
        </p>
      </div>

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

      {/* Credits Display */}
      {isLoadingCredits ? (
        <div className="h-6 w-32 animate-pulse bg-white/10 rounded mb-8"></div>
      ) : (
        <div className="flex items-center gap-2 mb-8">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Image className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white/80 font-medium">
              {credits} credits remaining
            </p>
            <p className="text-sm text-white/60">
              Your current usage this month
            </p>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: plan.isPopular ? -20 : 0,
              scale: plan.isPopular ? 1.05 : 1
            }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.5
            }}
            className={cn(
              "relative rounded-2xl p-8",
              "bg-muted/50 backdrop-blur-sm",
              "border border-white/10",
              plan.isPopular ? "border-blue-500/50 shadow-lg shadow-blue-500/20" : ""
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" /> Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">
                  ${isYearly ? plan.yearlyPrice : plan.price}
                </span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {plan.credits}
                {plan.period !== "one-time" && (
                  <span className="block">
                    {isYearly ? "Billed annually" : "Billed monthly"}
                  </span>
                )}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onUpgrade}
              className={cn(
                "w-full py-3 px-4 rounded-xl font-medium transition-all",
                "border border-white/10 hover:border-blue-500/50",
                "bg-gradient-to-r from-blue-600/10 to-blue-400/10",
                "hover:from-blue-600 hover:to-blue-400 hover:text-white",
                plan.isPopular ? "from-blue-600 to-blue-400 text-white" : "text-muted-foreground"
              )}
            >
              {plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
