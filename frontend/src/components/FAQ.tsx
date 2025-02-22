import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

const faqs = [
  {
    question: "What is Thumbnail Labs?",
    answer: "Thumbnail Labs is an AI-powered tool that helps content creators design high-quality YouTube thumbnails quickly and easily."
  },
  {
    question: "Why choose Thumbnail Labs over Midjourney or DALL·E?",
    answer: "It is the only AI generator trained specifically for YouTube thumbnails, ensuring precise and optimized results."
  },
  {
    question: "How can I re-create thumbnails from video links?",
    answer: "Simply paste a YouTube video link, and our AI will generate a new thumbnail in seconds."
  },
  {
    question: "Can I generate thumbnails using my face or AI-generated faces?",
    answer: "Yes! You can upload your face or use AI-generated faces that match your content's style."
  },
  {
    question: "Can I generate thumbnails from just a video title?",
    answer: "Yes, enter the YouTube video title, and our AI will create a thumbnail instantly."
  },
  {
    question: "Can I purchase extra credits if I run out?",
    answer: "Yes, additional credits can be purchased anytime."
  },
  {
    question: "Do credits expire, or can they roll over?",
    answer: "Credits reset on renewal, but you can enable 'Credit Rollover' to keep unused credits."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Thumbnails Labs
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "rounded-xl border border-white/10",
                "bg-muted/50 backdrop-blur-sm overflow-hidden",
                openIndex === index ? "bg-gradient-to-b from-blue-500/5 to-transparent" : ""
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full p-6 text-left"
              >
                <span className="text-lg font-medium">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "ml-4 flex-shrink-0",
                    openIndex === index ? "text-blue-400" : "text-muted-foreground"
                  )}
                >
                  <ChevronDown className="h-6 w-6" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center p-8 rounded-xl border border-white/10 bg-muted/50 backdrop-blur-sm"
        >
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-blue-500/10 text-blue-400 mb-4">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Our support team is here to help you 24/7
          </p>
          <button 
            onClick={() => window.location.href = 'mailto:thumbnailslabs@gmail.com'}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    </section>
  );
}