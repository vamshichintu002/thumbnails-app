import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface SubscriptionProps {
  credits: number;
  isLoadingCredits: boolean;
  onUpgrade: () => void;
}

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
}

const planFeatures: PlanFeature[] = [
  { name: 'Thumbnail Generation Credits', free: '5/month', pro: 'Unlimited' },
  { name: 'AI-Powered Generation', free: true, pro: true },
  { name: 'Custom Thumbnail Upload', free: true, pro: true },
  { name: 'Download Generated Images', free: true, pro: true },
  { name: 'Priority Generation', free: false, pro: true },
  { name: 'Advanced Customization', free: false, pro: true },
  { name: 'Priority Support', free: false, pro: true },
];

export const Subscription: React.FC<SubscriptionProps> = ({
  credits,
  isLoadingCredits,
  onUpgrade,
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Subscription</h2>
        <p className="text-white/60">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "rounded-xl p-6 space-y-6",
            "bg-white/5 backdrop-blur-sm border border-white/10",
          )}
        >
          <div>
            <h3 className="text-xl font-semibold">Free Plan</h3>
            <p className="text-white/60 mt-1">Perfect for getting started</p>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">$0</span>
            <span className="text-white/60">/month</span>
          </div>

          {isLoadingCredits ? (
            <div className="h-6 w-32 animate-pulse bg-white/10 rounded"></div>
          ) : (
            <p className="text-white/80">
              {credits} credits remaining this month
            </p>
          )}

          <ul className="space-y-3">
            {planFeatures.map((feature) => (
              <li 
                key={feature.name}
                className="flex items-center gap-2 text-sm"
              >
                {typeof feature.free === 'boolean' ? (
                  feature.free ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )
                ) : (
                  <span className="text-blue-400 font-medium">{feature.free}</span>
                )}
                <span className={cn(
                  typeof feature.free === 'boolean' && !feature.free && 'text-white/40'
                )}>
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>

          <button 
            disabled
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white/40 cursor-not-allowed"
          >
            Current Plan
          </button>
        </motion.div>

        {/* Pro Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-xl p-6 space-y-6",
            "bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm",
            "border border-white/20",
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">Pro Plan</h3>
              <p className="text-white/60 mt-1">For power users</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Popular
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">$9.99</span>
            <span className="text-white/60">/month</span>
          </div>

          <p className="text-white/80">Unlimited credits</p>

          <ul className="space-y-3">
            {planFeatures.map((feature) => (
              <li 
                key={feature.name}
                className="flex items-center gap-2 text-sm"
              >
                {typeof feature.pro === 'boolean' ? (
                  feature.pro ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )
                ) : (
                  <span className="text-blue-400 font-medium">{feature.pro}</span>
                )}
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>

          <button 
            onClick={onUpgrade}
            className={cn(
              "w-full px-4 py-2 rounded-lg",
              "bg-blue-600 hover:bg-blue-700",
              "transition-colors duration-200"
            )}
          >
            Upgrade to Pro
          </button>
        </motion.div>
      </div>
    </div>
  );
};
