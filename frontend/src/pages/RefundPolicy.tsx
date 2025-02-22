// RefundPolicy.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white/90 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Refund and Cancellation Policy</h1>
          <nav className="space-x-4">
            <Link to="/terms" className="text-blue-400 hover:text-blue-300">Terms & Conditions</Link>
            <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
          </nav>
        </div>

        <div className="space-y-6">
          <section>
            <p className="text-lg mb-6">
              At thumbnailslabs, we are committed to providing high-quality AI-powered thumbnail generation services through our subscription-based platform. Please carefully review our refund and cancellation policy before purchasing a subscription.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">Refund Policy</h2>
            <div className="mt-4 space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><span className="font-semibold">All Sales Are Final:</span> Once a subscription is purchased, no refunds or returns are applicable under any circumstances.</li>
                <li><span className="font-semibold">Subscription Plans:</span> Refunds will not be issued for unused time or credits within the subscription period.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">Cancellation Policy</h2>
            <div className="mt-4 space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscribers may cancel their subscription at any time; however, no refunds will be provided for the remaining time of the subscription period.</li>
                <li>After cancellation, the service will remain active until the end of the billing cycle.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">Trial Credits</h2>
            <div className="mt-4">
              <p>
                If you're a new user, we provide free trial credits to test the platform. Please use these trial credits to evaluate whether thumbnailslabs meets your needs before committing to a subscription.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">Contact Us</h2>
            <div className="mt-4">
              <p>
                If you encounter any issues with your subscription or the services provided, please reach out to our customer support team at <span className="text-blue-400">support@thumbnailslabs.com</span>. We are happy to assist you with any queries or concerns.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <p className="text-sm text-white/70">
              We encourage users to thoroughly review the features and functionality of thumbnailslabs using the trial credits before making a purchase. By subscribing to our platform, you acknowledge and agree to this refund and cancellation policy.
            </p>
            <p className="text-sm text-white/70 mt-4">
              Thank you for choosing thumbnailslabs!
            </p>
          </section>
        </div>

        <footer className="text-center text-white/60 pt-8">
          <p>Last updated: February 22, 2025</p>
          <p>Contact: support@thumbnailslabs.com</p>
        </footer>
      </div>
    </div>
  );
};

export default RefundPolicy;