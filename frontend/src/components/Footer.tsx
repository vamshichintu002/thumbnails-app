import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Send, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Newsletter Section */}
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Stay Connected</h2>
            <p className="mb-6 text-muted-foreground">
              Join our newsletter for the latest updates and exclusive offers.
            </p>
            <form className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pr-12 text-sm backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-blue-600 text-white transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4 m-auto" />
                <span className="sr-only">Subscribe</span>
              </button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-blue-600/10 blur-2xl" />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm">
              <a href="#features" className="block transition-colors hover:text-blue-400">
                Features
              </a>
              <a href="#pricing" className="block transition-colors hover:text-blue-400">
                Pricing
              </a>
              <a href="#testimonials" className="block transition-colors hover:text-blue-400">
                Testimonials
              </a>
              <a href="#faq" className="block transition-colors hover:text-blue-400">
                FAQ
              </a>
             
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <address className="space-y-2 text-sm not-italic text-muted-foreground">
              
  
              <p>Email: thumbnailslabs@gmail.com</p>
            </address>
          </div>

          {/* Social Links */}
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="mb-6 flex space-x-4">
              {[
                { icon: Youtube, label: "YouTube" },
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Linkedin, label: "LinkedIn" }
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="rounded-full border border-white/10 p-2 transition-colors hover:bg-white/5 hover:text-blue-400"
                >
                  <Icon className="h-4 w-4" />
                  <span className="sr-only">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 Thumbnails Labs. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <a href="/privacy-policy" className="transition-colors hover:text-blue-400">
              Privacy Policy
            </a>
            <a href="/terms" className="transition-colors hover:text-blue-400">
              Terms of Service
            </a>
            <a href="/refund-policy" className="transition-colors hover:text-blue-400">
              Refund Policy
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}